# %%
from sklearn.decomposition import PCA
import plotly.express as px
import pandas as pd
import networkx as nx
import plotly.graph_objs as go
import plotly.offline as pyo
from embedding_functions import *
from experiment_setup import *
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt


# %%
# find intersection of two lists
def intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))


# find union of two lists
def union(list1, list2):
    final_list = list(list1) + list(list2)
    return final_list


def make_adjacency_matrix(n, source, target, weight=None):
    """
    Make adjacency matrix from source and target arrays.
    """

    if weight is None:
        weights = np.ones(len(n))
    else:
        weights = weight
    A1 = sparse.coo_matrix((weights, (source, target)), shape=(n, n))
    A2 = sparse.coo_matrix((weights, (target, source)), shape=(n, n))
    return A1 + A2


# %%

data = pd.read_csv("harry_potter_data/harry_potter.csv", sep=",")
attributes = pd.read_csv("harry_potter_data/HP-characters.csv", sep=",")


# find unique elements of a list
def unique(list1):
    unique_list = []
    for x in list1:
        if x not in unique_list:
            unique_list.append(x)
    return unique_list


present_ids = sorted(unique(union(data["source"].unique(), data["target"].unique())))
attributes = attributes[attributes["id"].isin(present_ids)].reset_index(drop=True)
nodes = list(attributes["name"])
n = len(nodes)
id_to_node = dict(zip(range(len(nodes)), nodes))

data = data.replace("-", 1)
data = data.replace("+", 0)

A = make_adjacency_matrix(n, data["source"], data["target"], data["type"])

# %%
# Add 5 empty columns to A
# A = sparse.hstack((A, sparse.csr_matrix((n, 5))))


# %%
# remove zero degree nodes
degrees = np.array(A.sum(axis=0)).flatten()
A = A[degrees > 0, :]
A = A[:, degrees > 0]
nodes = np.array(nodes)[degrees > 0]
degrees = degrees[degrees > 0]
n = len(nodes)

# degrees = np.sqrt(np.sqrt(degrees))

top_five_degree = np.argsort(degrees)[-5:]
top_five_degree_nodes = nodes[top_five_degree]
top_five_degree_class = np.where(np.isin(nodes, top_five_degree_nodes), "1", "0")

# %%

ya = UASE([A.astype(float)], d=2, sparse_matrix=True)
# ya = unfolded_n2v([A.astype(float)], d=3, sparse_matrix=True, two_hop=False)
# ya = PCA(n_components=2).fit_transform(ya)


plot_embedding(ya, A.shape[0], 1, nodes)

# %%
# # Get the adjacency matrix
# A = nx.to_numpy_matrix(G)

# # Focus on emnity network (replace 2 with 0)
# A = np.where(A == 1, 0, A)
# A = np.where(A == -1, 1, A)

ya = single_spectral(A.todense().astype(float), 2)
plot_embedding(ya, A.shape[0], 1, nodes)

# Get approximate goodies/baddies
goodies = nodes[np.where(ya[:, 1] > 0)[0]]
baddies = nodes[np.where(ya[:, 1] < 0)[0]]

node_class = np.where(np.isin(nodes, goodies), "good", "bad")
plot_embedding(ya, A.shape[0], 1, node_class)

# %%

# Have selected emnity network (link if bad interaction)

# import nodevectors

# ya = nodevectors.Node2Vec(
#     n_components=2, walklen=10, epochs=2000, w2vparams={"window": 3}
# ).fit_transform(A @ A.T)

# # ya = PCA(n_components=2).fit_transform(ya)

# plot_embedding(ya, n, 1, nodes)
# plot_embedding(ya, n, 1, node_class)


# %%
# ya = PCA(n_components=2).fit_transform(ya)

# %%
house = [attributes[attributes["name"] == i]["house"].values[0] for i in nodes]

plot_df = pd.DataFrame(
    {
        "x_emb": ya[:, 0],
        "y_emb": ya[:, 1],
        "name": nodes,
        "house": house,
        "good_bad": node_class,
        "degree": degrees,
        "main": top_five_degree_class,
        "id": np.arange(0, n),
    }
)
# %%


# %%
# ya = UASE([A.astype(float)], d=2, sparse_matrix=True)
# plot_df = pd.DataFrame({"x_emb": ya[:, 0], "y_emb": ya[:, 1], "tau": nodes})
# plot_df["id"] = np.arange(0, A.shape[0])
# plot_df["degree"] = np.array(A.sum(axis=0)).flatten()
# plot_df["house"] = attributes["house"]

# ya = unfolded_n2v([A.astype(float)], d=3, sparse_matrix=True, two_hop=False)
# plot_df_n2v = pd.DataFrame({"x_emb": ya[:, 0], "y_emb": ya[:, 1], "tau": nodes})
# plot_df_n2v["id"] = np.arange(0, A.shape[0])
# plot_df_n2v["degree"] = np.array(A.sum(axis=0)).flatten()
# plot_df_n2v["house"] = attributes["house"]
# %%
# # Save as csv
plot_df.to_csv("data/plot_df.csv")

# plot_df_n2v.to_csv("data/plot_df_n2v.csv")
#
from networkx.readwrite import json_graph
import json


# json_graph.node_link_data(G_list[0])

# # Save json graph
# for i, G in enumerate(G_list):
#     with open(f"graph_n={n[i]}.json", "w") as f:
#         json.dump(json_graph.node_link_data(G), f)


# Save json graph

# Convert tau_for_graphs to a list of ints
G = nx.from_numpy_array(A)


# Set tau as a node attribute
nx.set_node_attributes(G, dict(zip(G.nodes(), nodes)), "name")
nx.set_node_attributes(G, dict(zip(G.nodes(), degrees.astype(float))), "degree")
nx.set_node_attributes(G, dict(zip(G.nodes(), top_five_degree_class)), "main")
nx.set_node_attributes(G, dict(zip(G.nodes(), house)), "house")
nx.set_node_attributes(G, dict(zip(G.nodes(), node_class)), "good_bad")

# Save graph as a JSON file
with open(f"data/emnity_graph.json", "w") as f:
    json.dump(json_graph.node_link_data(G), f)

pos = nx.spring_layout(G)

# Save the spring layout positions of the nodes and edge in a dataframe format, similar to how we saved ya for each graph in graph_list
pos_df = pd.DataFrame.from_dict(pos, orient="index")
pos_df.columns = ["x", "y"]
pos_df["id"] = pos_df.index
pos_df["name"] = nodes
pos_df["house"] = house
pos_df["good_bad"] = node_class
pos_df["degree"] = degrees
pos_df["main"] = top_five_degree_class
pos_df.to_csv("data/pos_emnity_graph.csv")


# %%
