using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Simple HTTP client for talking to the FastAPI backend from Unity.
/// Attach this to a GameObject (e.g. ExperimentManager) and configure the baseUrl in the Inspector.
/// </summary>
public class BackendClient : MonoBehaviour
{
    [Header("Backend configuration")]
    [SerializeField] private string baseUrl = "http://localhost:8000";

    public string CurrentSessionId { get; private set; }

    [System.Serializable]
    private class SessionCreateRequest
    {
        public string scene_version;
        public string participant_id;
        public string condition;
    }

    [System.Serializable]
    private class SessionResponse
    {
        public string session_id;
    }

    [System.Serializable]
    private class RecallRequest
    {
        public string session_id;
        public string question_id;
        public string object_key;
        public string user_answer;
    }

    public void StartNewSession(string sceneVersion, string participantId = null, string condition = null)
    {
        var payload = new SessionCreateRequest
        {
            scene_version = sceneVersion,
            participant_id = participantId,
            condition = condition
        };
        StartCoroutine(PostJson("/sessions", JsonUtility.ToJson(payload), OnSessionCreated));
    }

    public void SendRecallAnswer(string questionId, string objectKey, string userAnswer)
    {
        if (string.IsNullOrEmpty(CurrentSessionId))
        {
            Debug.LogError("No active session_id. Start a session before sending recall answers.");
            return;
        }

        var payload = new RecallRequest
        {
            session_id = CurrentSessionId,
            question_id = questionId,
            object_key = objectKey,
            user_answer = userAnswer
        };
        StartCoroutine(PostJson("/recall", JsonUtility.ToJson(payload), null));
    }

    private IEnumerator PostJson(string path, string jsonBody, System.Action<string> onSuccess)
    {
        var url = baseUrl.TrimEnd('/') + path;
        var bodyRaw = Encoding.UTF8.GetBytes(jsonBody);

        using (var request = new UnityWebRequest(url, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Backend POST {url} failed: {request.responseCode} {request.error}");
            }
            else
            {
                var text = request.downloadHandler.text;
                if (onSuccess != null)
                {
                    onSuccess(text);
                }
            }
        }
    }

    private void OnSessionCreated(string jsonResponse)
    {
        var session = JsonUtility.FromJson<SessionResponse>(jsonResponse);
        CurrentSessionId = session.session_id;
        Debug.Log($"Started new session with id: {CurrentSessionId}");
    }
}

