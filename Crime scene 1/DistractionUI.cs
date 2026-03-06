using UnityEngine;

/// <summary>
/// Shows the distraction puzzle (e.g. "Solve this quickly: 23 + 18 = ?")
/// and a countdown for the distraction phase. Attach to a GameObject in DistractionScene.
/// The ExperimentController will load the next scene after its distraction duration (10s).
/// </summary>
public class DistractionUI : MonoBehaviour
{
    [Tooltip("Duration of the distraction phase in seconds")]
    public float duration = 10f;

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
        float w = 420f;
        float h = 120f;
        float x = (Screen.width - w) * 0.5f;
        float y = (Screen.height - h) * 0.5f - 40f;

        GUI.color = Color.white;
        GUI.backgroundColor = new Color(0f, 0f, 0f, 0.75f);
        GUI.contentColor = Color.white;
        GUI.skin.label.fontSize = 22;
        GUI.skin.label.alignment = TextAnchor.MiddleCenter;

        GUI.Box(new Rect(x - 6, y - 6, w + 12, h + 12), "");

        GUI.skin.label.fontSize = 20;
        GUI.Label(new Rect(x, y, w, 36), "Solve this quickly:");
        GUI.skin.label.fontSize = 28;
        GUI.Label(new Rect(x, y + 38, w, 40), "23 + 18 = ?");
        GUI.skin.label.fontSize = 16;
        int sec = Mathf.CeilToInt(remaining);
        GUI.Label(new Rect(x, y + 88, w, 24), sec > 0 ? string.Format("Time left: {0}s", sec) : "Next scene loading...");
    }
}
