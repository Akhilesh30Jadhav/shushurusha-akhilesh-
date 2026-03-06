import os
import subprocess

repo_dir = "C:/RAG MODEL"
os.chdir(repo_dir)

commands = [
    ["git", "init"],
    ["git", "add", "."],
    ["git", "commit", "-m", "Initial commit: Added RAG simulation engine"],
    ["git", "branch", "-M", "main"],
    ["git", "remote", "add", "origin", "https://github.com/csiraitofficial/Aarohan-26-CSI-RAIT-Team-Orbix.git"],
    ["git", "push", "-u", "origin", "main"]
]

for cmd in commands:
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
