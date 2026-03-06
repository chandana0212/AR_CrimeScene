using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneTimer : MonoBehaviour
{
    public float timer = 20f;

    void Start()
    {
        Invoke("LoadNextScene", timer);
    }

    void LoadNextScene()
    {
        SceneManager.LoadScene("scene 1 modified");
    }
}