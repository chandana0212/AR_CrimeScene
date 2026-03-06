using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Orchestrates the experimental flow:
/// 1. Show Scene_Before for 25s (timer visible)
/// 2. Distraction scene (math puzzle) for 10s
/// 3. New crime scene (optional) for 25s — set newSceneName in Inspector
/// 4. Scene_After (modified scene)
/// 5. Optional recall scene; recall form is on the dashboard.
/// Persists across scene loads so the sequence runs to completion.
/// </summary>
public class ExperimentController : MonoBehaviour
{
    [Header("Scene names (must match names in Build Settings)")]
    public string beforeSceneName = "CrimeScene_Before";
    public string afterSceneName = "CrimeScene_After";
    public string distractionSceneName = "DistractionScene";
    [Tooltip("New crime scene shown after distraction; leave empty to skip")]
    public string newSceneName = "";
    public string recallSceneName = "RecallScene";

    [Header("Durations (seconds)")]
    public float beforeDuration = 25f;
    public float distractionDuration = 10f;
    [Tooltip("How long to show the new crime scene before continuing")]
    public float newSceneDuration = 25f;
    public float afterDuration = 15f;

    [Header("Backend")]
    public string sceneVersion = "crime_scene_1";
    public BackendClient backendClient;

    private void Awake()
    {
        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        StartCoroutine(RunExperiment());
    }

    private IEnumerator RunExperiment()
    {
        // Assume we are already in the 'before' scene when this script starts.
        yield return new WaitForSeconds(beforeDuration);

        // Distraction phase
        if (!string.IsNullOrEmpty(distractionSceneName))
        {
            SceneManager.LoadScene(distractionSceneName);
            yield return new WaitForSeconds(distractionDuration);
        }

        // New crime scene (after distraction) — 25s then continue
        if (!string.IsNullOrEmpty(newSceneName))
        {
            SceneManager.LoadScene(newSceneName);
            yield return new WaitForSeconds(newSceneDuration);
        }

        // Modified crime scene
        if (!string.IsNullOrEmpty(afterSceneName))
        {
            SceneManager.LoadScene(afterSceneName);
            yield return new WaitForSeconds(afterDuration);
        }

        // Move to recall UI
        if (!string.IsNullOrEmpty(recallSceneName))
        {
            SceneManager.LoadScene(recallSceneName);
        }
    }
}

