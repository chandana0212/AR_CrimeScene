using UnityEngine;

/// <summary>
/// Shows a visible countdown during the observation phase (e.g. 25 seconds).
/// Attach to a GameObject in Scene_Before. No canvas required; uses OnGUI.
/// </summary>
public class ObservationTimer : MonoBehaviour
{
    [Tooltip("Total observation time in seconds")]
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
            ? string.Format("Observation time: {0}s — Pay attention to details.", seconds)
            : "Observation complete.";

        float w = 400f;
        float h = 40f;
        float x = (Screen.width - w) * 0.5f;
        float y = 20f;

        GUI.color = new Color(1f, 1f, 1f, 0.95f);
        GUI.backgroundColor = new Color(0f, 0f, 0f, 0.7f);
        GUI.contentColor = Color.white;
        GUI.skin.label.fontSize = 18;
        GUI.skin.label.alignment = TextAnchor.MiddleCenter;

        GUI.Box(new Rect(x - 4, y - 4, w + 8, h + 8), "");
        GUI.Label(new Rect(x, y, w, h), text);
    }
}
