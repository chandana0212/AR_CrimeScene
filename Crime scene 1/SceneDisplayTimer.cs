using UnityEngine;

/// <summary>
/// Displays a countdown timer when this scene is shown (e.g. after distraction).
/// Attach to a GameObject in the "new crime scene". Does not trigger scene transition
/// — ExperimentController handles loading the next scene after newSceneDuration (25s).
/// </summary>
public class SceneDisplayTimer : MonoBehaviour
{
    [Tooltip("Display duration in seconds (should match ExperimentController.newSceneDuration)")]
    public float duration = 25f;

    private float remaining;
    private bool running;

    private void Start()
    {
        remaining = duration;
        running = true;
    }

    private void Update()
    {
        if (!running) return;
        remaining -= Time.deltaTime;
        if (remaining <= 0f)
        {
            remaining = 0f;
            running = false;
        }
    }

    private void OnGUI()
    {
        if (!running && remaining <= 0f) return;

        int seconds = Mathf.CeilToInt(remaining);
        string text = seconds > 0
            ? string.Format("Scene display: {0}s — Look around.", seconds)
            : "Next scene loading...";

        float w = 380f;
        float h = 36f;
        float x = (Screen.width - w) * 0.5f;
        float y = 20f;

        GUI.color = new Color(1f, 1f, 1f, 0.95f);
        GUI.backgroundColor = new Color(0f, 0f, 0f, 0.7f);
        GUI.contentColor = Color.white;
        GUI.skin.label.fontSize = 16;
        GUI.skin.label.alignment = TextAnchor.MiddleCenter;

        GUI.Box(new Rect(x - 4, y - 4, w + 8, h + 8), "");
        GUI.Label(new Rect(x, y, w, h), text);
    }
}
