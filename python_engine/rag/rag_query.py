import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Use absolute path based on this file's location to ensure robust importing
current_dir = os.path.dirname(os.path.abspath(__file__))
vectorstore_path = os.path.join(current_dir, "vectorstore")
db = FAISS.load_local(vectorstore_path, embedding, allow_dangerous_deserialization=True)

def get_protocol(query):

    docs = db.similarity_search(query, k=3)

    context = ""

    for d in docs:
        context += d.page_content + "\n"

    return context