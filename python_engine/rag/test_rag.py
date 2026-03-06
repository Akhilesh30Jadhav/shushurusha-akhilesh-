from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

# Load embedding model
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Load vector database
db = FAISS.load_local("vectorstore", embedding, allow_dangerous_deserialization=True)

# Search function
def get_protocol(query):
    docs = db.similarity_search(query, k=3)
    for i, doc in enumerate(docs):
        print("\nResult", i+1)
        print(doc.page_content[:800])

# Test query
get_protocol("snake bite first aid for rural health worker")