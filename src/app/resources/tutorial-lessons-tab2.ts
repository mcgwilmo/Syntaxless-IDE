import { example, lesson, topic, type Lesson } from "./tutorial-types";

function block(text: string) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const trimBy = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(trimBy));
}

export const TAB_TWO_LESSONS: Lesson[] = [
  lesson(
    "linked-list",
    1,
    "Linked List",
    "A linked list stores values in nodes, where each node points to the next node. Unlike an array-like structure, elements do not have to sit next to each other in memory, which makes insertion and deletion near known locations natural while ordinary searching still requires stepping through the chain one node at a time.",
    [
      topic(
        "linked-list-initialization-with-classes",
        "Initialization with classes",
        "Initialization is the process of defining the node object and the list object, then setting the head pointer to the first node or to empty. In an object-oriented design, the list class owns the head and any helper methods.",
        "This is used because a linked list is not just a bag of values. It is a relationship between nodes. By using a Node class and a LinkedList class, the learner sees exactly what the structure must remember: where the first node is, how new nodes are attached, and how the chain is traversed.",
        [
              example(
                "linked-list-initialization-with-classes-example",
                block(`
                  Create a class named Node.
                  Define a function named initialize that takes value.
                  Set self.value to value.
                  Set self.next to null.
                  Create a class named LinkedList.
                  Define a function named initialize.
                  Set self.head to null.
                  Define a function named append that takes value.
                  Create new_node as Node(value).
                  If self.head is null, then.
                  Set self.head to new_node.
                  Return.
                  End the if.
                  Set current to self.head.
                  While current.next is not null.
                  Set current to current.next.
                  End the while.
                  Set current.next to new_node.
                  Create numbers as LinkedList().
                  Call numbers.append(7).
                  Call numbers.append(11).
                  Call numbers.append(15).
                `),
                block(`
                  Create Node with initialize storing value and next.
                  Create LinkedList with initialize setting head to null.
                  Define append(value) to create new_node, set head if empty, otherwise walk to the end and attach it.
                  Create numbers and append 7, 11, and 15.
                `),
                block(`
                  Build Node and LinkedList classes, then append 7, 11, and 15 to numbers.
                `),
                block(`
                  CLASS Node
                  FUNCTION initialize(value)
                  SET self.value = value
                  SET self.next = null
                  CLASS LinkedList
                  FUNCTION initialize()
                  SET self.head = null
                  FUNCTION append(value)
                  CREATE new_node AS Node(value)
                  IF self.head IS null THEN
                  SET self.head = new_node
                  RETURN
                  END IF
                  SET current = self.head
                  WHILE current.next IS NOT null
                  SET current = current.next
                  END WHILE
                  SET current.next = new_node
                  CREATE numbers AS LinkedList()
                  CALL numbers.append(7)
                  CALL numbers.append(11)
                  CALL numbers.append(15)
                `)
              )
            ]
      ),
      topic(
        "linked-list-linear-search",
        "Linear search",
        "Linear search in a linked list means starting at the head and checking each node until the target is found or the list ends.",
        "It is used because linked lists do not support direct indexing the way arrays do. The only reliable way to find a value is to follow the next pointers one by one. This makes the cost proportional to how far through the chain the value appears.",
        [
              example(
                "linked-list-linear-search-example",
                block(`
                  Define a function named contains that takes target.
                  Set current to self.head.
                  While current is not null.
                  If current.value = target, then.
                  Return true.
                  End the if.
                  Set current to current.next.
                  End the while.
                  Return false.
                `),
                block(`
                  Define contains(target).
                  Start current at self.head and walk through the list.
                  Return true when current.value = target.
                  Otherwise move to current.next until the list ends.
                  Return false if target is never found.
                `),
                block(`
                  Traverse from head to tail and return whether target appears.
                `),
                block(`
                  FUNCTION contains(target)
                  SET current = self.head
                  WHILE current IS NOT null
                  IF current.value = target THEN
                  RETURN true
                  END IF
                  SET current = current.next
                  END WHILE
                  RETURN false
                `)
              )
            ]
      ),
      topic(
        "linked-list-insert-at-the-front",
        "Insert at the front",
        "Insert at the front creates a new node and makes that node the new head of the list.",
        "This is one of the main strengths of a linked list. The operation is constant-time because no existing values need to shift. Only the head reference and the new node's next reference need to be updated.",
        [
              example(
                "linked-list-insert-at-the-front-example",
                block(`
                  Define a function named push_front that takes value.
                  Create new_node as Node(value).
                  Set new_node.next to self.head.
                  Set self.head to new_node.
                `),
                block(`
                  Define push_front(value).
                  Create new_node, point it to the old head, and make it the new head.
                `),
                block(`
                  Insert a new node at the front of the list.
                `),
                block(`
                  FUNCTION push_front(value)
                  CREATE new_node AS Node(value)
                  SET new_node.next = self.head
                  SET self.head = new_node
                `)
              )
            ]
      ),
      topic(
        "linked-list-insert-after-a-known-node",
        "Insert after a known node",
        "Insert after a known node means splicing a new node into the chain after a node that has already been located.",
        "It is used when the program already has a pointer to the position where the new value belongs. This is efficient because the list does not have to shift later elements. Only a few references are rewired.",
        [
              example(
                "linked-list-insert-after-a-known-node-example",
                block(`
                  Define a function named insert_after that takes node, value.
                  If node is null, then.
                  Return.
                  End the if.
                  Create new_node as Node(value).
                  Set new_node.next to node.next.
                  Set node.next to new_node.
                `),
                block(`
                  Define insert_after(node, value).
                  Return if node is null.
                  Create new_node, preserve node.next, and link new_node after node.
                `),
                block(`
                  Splice a new node in immediately after a known node.
                `),
                block(`
                  FUNCTION insert_after(node, value)
                  IF node IS null THEN
                  RETURN
                  END IF
                  CREATE new_node AS Node(value)
                  SET new_node.next = node.next
                  SET node.next = new_node
                `)
              )
            ]
      ),
      topic(
        "linked-list-delete-by-value",
        "Delete by value",
        "Delete by value removes the first node whose value matches the target and reconnects the surrounding nodes so the chain remains intact.",
        "It is used when the goal is to remove a logical item from the list. Deletion is natural in a linked list because values do not need to shift left. The key challenge is keeping track of the node before the node being removed.",
        [
              example(
                "linked-list-delete-by-value-example",
                block(`
                  Define a function named delete_value that takes target.
                  If self.head is null, then.
                  Return false.
                  End the if.
                  If self.head.value = target, then.
                  Set self.head to self.head.next.
                  Return true.
                  End the if.
                  Set previous to self.head.
                  Set current to self.head.next.
                  While current is not null.
                  If current.value = target, then.
                  Set previous.next to current.next.
                  Return true.
                  End the if.
                  Set previous to current.
                  Set current to current.next.
                  End the while.
                  Return false.
                `),
                block(`
                  Define delete_value(target).
                  Handle the empty list and the case where the head matches.
                  Walk previous and current through the list until target is found.
                  Bypass the matching node and return true.
                  Return false if no node matches.
                `),
                block(`
                  Remove the first node whose value equals target and report success.
                `),
                block(`
                  FUNCTION delete_value(target)
                  IF self.head IS null THEN
                  RETURN false
                  END IF
                  IF self.head.value = target THEN
                  SET self.head = self.head.next
                  RETURN true
                  END IF
                  SET previous = self.head
                  SET current = self.head.next
                  WHILE current IS NOT null
                  IF current.value = target THEN
                  SET previous.next = current.next
                  RETURN true
                  END IF
                  SET previous = current
                  SET current = current.next
                  END WHILE
                  RETURN false
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "doubly-linked-list",
    2,
    "Doubly Linked List",
    "A doubly linked list is like a linked list, but each node stores both a next pointer and a previous pointer. This extra link makes backward movement and deletion from known positions easier, at the cost of more memory and slightly more bookkeeping.",
    [
      topic(
        "doubly-linked-list-initialization",
        "Initialization with previous and next references",
        "Initialization defines nodes that know both their predecessor and successor, and a list object that usually stores both a head and a tail.",
        "It is used because many real tasks need movement in both directions. A tail pointer also makes appending more natural because the structure remembers where the chain ends.",
        [
              example(
                "doubly-linked-list-initialization-example",
                block(`
                  Create a class named DoublyNode.
                  Define a function named initialize that takes value.
                  Set self.value to value.
                  Set self.next to null.
                  Set self.prev to null.
                  Create a class named DoublyLinkedList.
                  Define a function named initialize.
                  Set self.head to null.
                  Set self.tail to null.
                  Define a function named append that takes value.
                  Create new_node as DoublyNode(value).
                  If self.head is null, then.
                  Set self.head to new_node.
                  Set self.tail to new_node.
                  Return.
                  End the if.
                  Set self.tail.next to new_node.
                  Set new_node.prev to self.tail.
                  Set self.tail to new_node.
                `),
                block(`
                  Create DoublyNode with value, next, and prev.
                  Create DoublyLinkedList with head and tail starting at null.
                  Define append(value) to handle the empty list or link the new node after the current tail.
                `),
                block(`
                  Build a doubly linked list with head and tail pointers and append support.
                `),
                block(`
                  CLASS DoublyNode
                  FUNCTION initialize(value)
                  SET self.value = value
                  SET self.next = null
                  SET self.prev = null
                  CLASS DoublyLinkedList
                  FUNCTION initialize()
                  SET self.head = null
                  SET self.tail = null
                  FUNCTION append(value)
                  CREATE new_node AS DoublyNode(value)
                  IF self.head IS null THEN
                  SET self.head = new_node
                  SET self.tail = new_node
                  RETURN
                  END IF
                  SET self.tail.next = new_node
                  SET new_node.prev = self.tail
                  SET self.tail = new_node
                `)
              )
            ]
      ),
      topic(
        "doubly-linked-list-bidirectional-search-and-traversal",
        "Bidirectional search and traversal",
        "Traversal means walking through the nodes. In a doubly linked list, the walk can begin at the head and move forward or begin at the tail and move backward.",
        "This is used when a program needs to undo, reverse-iterate, or inspect neighbors on both sides. Searching by value is still linear, but the extra direction changes how surrounding structure can be inspected and edited.",
        [
              example(
                "doubly-linked-list-bidirectional-search-and-traversal-example",
                block(`
                  Define a function named print_forward.
                  Set current to self.head.
                  While current is not null.
                  Output current.value.
                  Set current to current.next.
                  End the while.
                  Define a function named print_backward.
                  Set current to self.tail.
                  While current is not null.
                  Output current.value.
                  Set current to current.prev.
                  End the while.
                `),
                block(`
                  Define print_forward and walk from head through next links.
                  Define print_backward and walk from tail through prev links.
                  Output each value during both traversals.
                `),
                block(`
                  Traverse the list forward from head and backward from tail.
                `),
                block(`
                  FUNCTION print_forward()
                  SET current = self.head
                  WHILE current IS NOT null
                  OUTPUT current.value
                  SET current = current.next
                  END WHILE
                  FUNCTION print_backward()
                  SET current = self.tail
                  WHILE current IS NOT null
                  OUTPUT current.value
                  SET current = current.prev
                  END WHILE
                `)
              )
            ]
      ),
      topic(
        "doubly-linked-list-insert-before-or-after-a-node",
        "Insert before or after a node",
        "A doubly linked list can insert relative to a known node by updating four references: the new node's prev and next, and the neighboring nodes that must point to it.",
        "This is used when the list represents an ordered sequence and insertion must happen at a precise local position. Because both directions are stored, the structure can be updated without searching for the predecessor separately.",
        [
              example(
                "doubly-linked-list-insert-before-or-after-a-node-example",
                block(`
                  Define a function named insert_before that takes node, value.
                  If node is null, then.
                  Return.
                  End the if.
                  Create new_node as DoublyNode(value).
                  Set new_node.next to node.
                  Set new_node.prev to node.prev.
                  If node.prev is not null, then.
                  Set node.prev.next to new_node.
                  Otherwise.
                  Set self.head to new_node.
                  End the if.
                  Set node.prev to new_node.
                `),
                block(`
                  Define insert_before(node, value).
                  Return if node is null.
                  Create new_node, connect it before node, and update the surrounding prev and next links.
                  Set self.head when the insertion happens before the old first node.
                `),
                block(`
                  Insert a new node before a known node and repair both directions.
                `),
                block(`
                  FUNCTION insert_before(node, value)
                  IF node IS null THEN
                  RETURN
                  END IF
                  CREATE new_node AS DoublyNode(value)
                  SET new_node.next = node
                  SET new_node.prev = node.prev
                  IF node.prev IS NOT null THEN
                  SET node.prev.next = new_node
                  ELSE
                  SET self.head = new_node
                  END IF
                  SET node.prev = new_node
                `)
              )
            ]
      ),
      topic(
        "doubly-linked-list-delete-a-known-node",
        "Delete a known node",
        "Deleting a known node removes it by connecting its predecessor directly to its successor and then updating head or tail when necessary.",
        "It is especially useful in structures such as browser histories, deques, and LRU caches because once the node is known, removal is local and efficient.",
        [
              example(
                "doubly-linked-list-delete-a-known-node-example",
                block(`
                  Define a function named delete_node that takes node.
                  If node is null, then.
                  Return false.
                  End the if.
                  If node.prev is not null, then.
                  Set node.prev.next to node.next.
                  Otherwise.
                  Set self.head to node.next.
                  End the if.
                  If node.next is not null, then.
                  Set node.next.prev to node.prev.
                  Otherwise.
                  Set self.tail to node.prev.
                  End the if.
                  Return true.
                `),
                block(`
                  Define delete_node(node).
                  Return false if node is null.
                  Reconnect node.prev and node.next around the node being removed.
                  Update self.head or self.tail when the removed node is at an end.
                  Return true after deletion.
                `),
                block(`
                  Delete a known node by reconnecting its neighbors and updating head or tail when needed.
                `),
                block(`
                  FUNCTION delete_node(node)
                  IF node IS null THEN
                  RETURN false
                  END IF
                  IF node.prev IS NOT null THEN
                  SET node.prev.next = node.next
                  ELSE
                  SET self.head = node.next
                  END IF
                  IF node.next IS NOT null THEN
                  SET node.next.prev = node.prev
                  ELSE
                  SET self.tail = node.prev
                  END IF
                  RETURN true
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "hash-table",
    3,
    "Hash Table",
    "A hash table stores key-value pairs by transforming each key into an index with a hash function. When designed well, it gives very fast average-case lookup, insertion, and deletion. In Python, dictionaries already provide this behavior, but teaching the structure through classes makes the underlying idea visible.",
    [
      topic(
        "hash-table-initialization-with-buckets",
        "Initialization with buckets",
        "Initialization creates an array of buckets and chooses a hash rule that maps keys into bucket positions. Each bucket may store a small chain or list of entries to handle collisions.",
        "This is used because a hash table is really two ideas combined: a fast address calculation and a collision strategy. Building the class explicitly teaches that keys can collide and that the table must still preserve every key-value pair correctly.",
        [
              example(
                "hash-table-initialization-with-buckets-example",
                block(`
                  Create a class named HashTable.
                  Define a function named initialize that takes capacity.
                  Set self.capacity to capacity.
                  Set self.buckets to array of empty lists of length capacity.
                  Define a function named hash that takes key.
                  Return computed_index_from_key mod self.capacity.
                `),
                block(`
                  Create HashTable with capacity and an array of empty bucket lists.
                  Define hash(key) to compute an index modulo capacity.
                `),
                block(`
                  Initialize a hash table with bucket storage and a hash-to-index function.
                `),
                block(`
                  CLASS HashTable
                  FUNCTION initialize(capacity)
                  SET self.capacity = capacity
                  SET self.buckets = array of empty lists of length capacity
                  FUNCTION hash(key)
                  RETURN computed_index_from_key MOD self.capacity
                `)
              )
            ]
      ),
      topic(
        "hash-table-search-by-key",
        "Search by key",
        "Searching in a hash table first hashes the key to find the correct bucket and then searches only within that bucket for the matching key.",
        "It is used because the hash function narrows the search area dramatically. Instead of scanning every entry, the program jumps directly to the small bucket where the key should live. This is why hash tables are a common choice for symbol tables, caches, and frequency counters.",
        [
              example(
                "hash-table-search-by-key-example",
                block(`
                  Define a function named get that takes key.
                  Set index to hash(key).
                  For each pair in self.buckets[index].
                  If pair.key = key, then.
                  Return pair.value.
                  End the if.
                  End the for.
                  Return not_found.
                `),
                block(`
                  Define get(key).
                  Hash the key to choose a bucket.
                  Scan the bucket for a matching pair and return its value.
                  Return not_found if the key is missing.
                `),
                block(`
                  Look up a key by hashing to its bucket and scanning that bucket.
                `),
                block(`
                  FUNCTION get(key)
                  SET index = hash(key)
                  FOR EACH pair IN self.buckets[index]
                  IF pair.key = key THEN
                  RETURN pair.value
                  END IF
                  END FOR
                  RETURN not_found
                `)
              )
            ]
      ),
      topic(
        "hash-table-insert-or-update",
        "Insert or update",
        "Insertion places a new key-value pair into its bucket. If the key already exists, the value is updated rather than duplicated.",
        "This is used because many table operations really mean assign a value to a key, whether that key is new or already present. Update-on-duplicate is what makes hash tables natural for counting and memoization tasks.",
        [
              example(
                "hash-table-insert-or-update-example",
                block(`
                  Define a function named put that takes key, value.
                  Set index to hash(key).
                  For each pair in self.buckets[index].
                  If pair.key = key, then.
                  Set pair.value to value.
                  Return.
                  End the if.
                  End the for.
                  Append (key, value) to self.buckets[index].
                `),
                block(`
                  Define put(key, value).
                  Hash the key to choose a bucket.
                  Update the value if the key already exists there.
                  Otherwise append a new key-value pair to that bucket.
                `),
                block(`
                  Hash the key, update it if present, or append a new entry if absent.
                `),
                block(`
                  FUNCTION put(key, value)
                  SET index = hash(key)
                  FOR EACH pair IN self.buckets[index]
                  IF pair.key = key THEN
                  SET pair.value = value
                  RETURN
                  END IF
                  END FOR
                  APPEND (key, value) TO self.buckets[index]
                `)
              )
            ]
      ),
      topic(
        "hash-table-delete-by-key",
        "Delete by key",
        "Deletion removes the pair whose key matches the target from the correct bucket.",
        "It is used when stale data should no longer be returned. Because the hash table can jump directly to the right bucket, deletion is local rather than global.",
        [
              example(
                "hash-table-delete-by-key-example",
                block(`
                  Define a function named delete that takes key.
                  Set index to hash(key).
                  For i from 0 to length(self.buckets[index]) - 1.
                  If self.buckets[index][i].key = key, then.
                  Remove entry at position i from self.buckets[index].
                  Return true.
                  End the if.
                  End the for.
                  Return false.
                `),
                block(`
                  Define delete(key).
                  Hash the key to choose a bucket.
                  Scan the bucket positions until the key is found.
                  Remove the matching entry and return true.
                  Return false if the key does not exist.
                `),
                block(`
                  Remove a key from its bucket and report whether deletion happened.
                `),
                block(`
                  FUNCTION delete(key)
                  SET index = hash(key)
                  FOR i FROM 0 TO length(self.buckets[index]) - 1
                  IF self.buckets[index][i].key = key THEN
                  REMOVE entry at position i from self.buckets[index]
                  RETURN true
                  END IF
                  END FOR
                  RETURN false
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "undirected-graph",
    4,
    "Undirected Graph",
    "An undirected graph stores objects as vertices and connections as edges, where each connection works both ways. This is the right model for roads without one-way restrictions, friendship relationships, and physical network links.",
    [
      topic(
        "undirected-graph-initialization",
        "Initialization with a Graph class and adjacency lists",
        "Initialization creates a graph object whose main state is an adjacency list. Each vertex maps to the vertices connected to it. In an undirected graph, adding an edge means recording the relationship in both directions.",
        "This is used because graphs are about relationships, not just storage. An adjacency list is compact and natural when most vertices connect to only a few others. Using a class keeps the rules for adding vertices and edges inside one object.",
        [
              example(
                "undirected-graph-initialization-example",
                block(`
                  Create a class named UndirectedGraph.
                  Define a function named initialize.
                  Set self.adj to empty map.
                  Define a function named add_vertex that takes v.
                  If v NOT in self.adj, then.
                  Set self.adj[v] to empty list.
                  End the if.
                  Define a function named add_edge that takes u, v.
                  Call add_vertex(u).
                  Call add_vertex(v).
                  Append v to self.adj[u].
                  Append u to self.adj[v].
                `),
                block(`
                  Create UndirectedGraph with an empty adjacency map.
                  Define add_vertex(v) to create an empty neighbor list when needed.
                  Define add_edge(u, v) to add both endpoints and append each vertex to the other's list.
                `),
                block(`
                  Build an undirected graph by storing each edge in both adjacency lists.
                `),
                block(`
                  CLASS UndirectedGraph
                  FUNCTION initialize()
                  SET self.adj = empty map
                  FUNCTION add_vertex(v)
                  IF v NOT IN self.adj THEN
                  SET self.adj[v] = empty list
                  END IF
                  FUNCTION add_edge(u, v)
                  CALL add_vertex(u)
                  CALL add_vertex(v)
                  APPEND v TO self.adj[u] APPEND u TO self.adj[v]
                `)
              )
            ]
      ),
      topic(
        "undirected-graph-breadth-first-search",
        "Breadth-first search for unweighted shortest paths",
        "Breadth-first search visits vertices level by level. In an unweighted graph, this means the first time a vertex is reached, it has been reached by the shortest number of edges.",
        "It is used because many graph questions are really minimum-step questions: what is the fewest number of hops, roads, or friend links needed to go from one place to another. BFS answers that exactly in unweighted settings.",
        [
              example(
                "undirected-graph-breadth-first-search-example",
                block(`
                  Define a function named bfs_shortest_path that takes start, goal.
                  Create queue.
                  Enqueue start.
                  Set visited to {start}.
                  Set parent[start] to null.
                  While queue is not empty.
                  Set current to dequeue queue.
                  If current = goal, then.
                  Stop the current loop.
                  End the if.
                  For each neighbor in self.adj[current].
                  If neighbor NOT in visited, then.
                  Add neighbor to visited.
                  Set parent[neighbor] to current.
                  Enqueue neighbor.
                  End the if.
                  End the for.
                  End the while.
                  Reconstruct path from parent map.
                `),
                block(`
                  Define bfs_shortest_path(start, goal).
                  Use a queue, visited set, and parent map starting from start.
                  Process vertices level by level until goal is reached.
                  Record parent links for newly discovered neighbors.
                  Reconstruct the path from the parent map.
                `),
                block(`
                  Use BFS to find and reconstruct the shortest unweighted path from start to goal.
                `),
                block(`
                  FUNCTION bfs_shortest_path(start, goal)
                  CREATE queue
                  ENQUEUE start
                  SET visited = {start}
                  SET parent[start] = null
                  WHILE queue IS NOT empty
                  SET current = DEQUEUE queue
                  IF current = goal THEN
                  BREAK END IF FOR EACH neighbor IN self.adj[current] IF neighbor NOT IN visited THEN ADD neighbor
                  TO visited SET parent[neighbor] = current ENQUEUE neighbor END IF END FOR END WHILE
                  RECONSTRUCT path from parent map
                `)
              )
            ]
      ),
      topic(
        "undirected-graph-depth-first-search",
        "Depth-first search for exploration and components",
        "Depth-first search follows one branch as far as possible before backtracking.",
        "It is used when the program wants to explore structure, find connected components, or test reachability. DFS is not an unweighted shortest-path algorithm, but it is excellent for understanding shape and connectivity.",
        [
              example(
                "undirected-graph-depth-first-search-example",
                block(`
                  Define a function named dfs that takes vertex.
                  Add vertex to visited.
                  For each neighbor in self.adj[vertex].
                  If neighbor NOT in visited, then.
                  Call dfs(neighbor).
                  End the if.
                  End the for.
                `),
                block(`
                  Define dfs(vertex).
                  Mark vertex visited.
                  Recursively visit each unvisited neighbor.
                `),
                block(`
                  Depth-first search visits a vertex, marks it, and recurses on unvisited neighbors.
                `),
                block(`
                  FUNCTION dfs(vertex)
                  ADD vertex TO visited
                  FOR EACH neighbor IN self.adj[vertex]
                  IF neighbor NOT IN visited THEN
                  CALL dfs(neighbor)
                  END IF
                  END FOR
                `)
              )
            ]
      ),
      topic(
        "undirected-graph-dijkstra",
        "Dijkstra for weighted graphs with non-negative edges",
        "Dijkstra's algorithm computes the shortest path from a source to all other vertices when every edge weight is non-negative.",
        "It is used when the graph measures cost, distance, or time instead of just step count. The algorithm repeatedly finalizes the smallest known tentative distance and relaxes outgoing edges.",
        [
              example(
                "undirected-graph-dijkstra-example",
                block(`
                  Define a function named dijkstra that takes start.
                  For each vertex.
                  Set distance[vertex] to infinity.
                  End the for.
                  Set distance[start] to 0.
                  Create priority_queue.
                  Insert (0, start).
                  While priority_queue is not empty.
                  Extract vertex with smallest tentative distance.
                  For each (neighbor, weight) adjacent to vertex.
                  If distance[vertex] + weight < distance[neighbor], then.
                  Set distance[neighbor] to distance[vertex] + weight.
                  Set parent[neighbor] to vertex.
                  Insert (distance[neighbor], neighbor).
                  End the if.
                  End the for.
                  End the while.
                `),
                block(`
                  Define dijkstra(start).
                  Initialize all distances to infinity except start.
                  Use a priority queue to repeatedly extract the closest vertex.
                  Relax each adjacent edge, updating distance and parent when a shorter path is found.
                `),
                block(`
                  Use Dijkstra's algorithm to update shortest distances and parents from start.
                `),
                block(`
                  FUNCTION dijkstra(start)
                  FOR EACH vertex
                  SET distance[vertex] = infinity
                  END FOR
                  SET distance[start] = 0
                  CREATE priority_queue
                  INSERT (0, start)
                  WHILE priority_queue IS NOT empty
                  EXTRACT vertex with smallest tentative distance FOR EACH (neighbor, weight) ADJACENT TO vertex IF
                  distance[vertex] + weight < distance[neighbor] THEN SET distance[neighbor] = distance[vertex] +
                  weight SET parent[neighbor] = vertex INSERT (distance[neighbor], neighbor) END IF END FOR END
                  WHILE
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "directed-graph",
    5,
    "Directed Graph",
    "A directed graph stores edges that point from one vertex to another in a specific direction. This is the natural model for web links, task dependencies, one-way streets, and state transitions.",
    [
      topic(
        "directed-graph-initialization",
        "Initialization with outgoing adjacency lists",
        "Initialization creates a map from each vertex to its outgoing neighbors. Adding a directed edge records only the forward direction.",
        "This is used because direction changes meaning. The edge A -> B says A can reach B directly, but B does not automatically reach A.",
        [
              example(
                "directed-graph-initialization-example",
                block(`
                  Create a class named DirectedGraph.
                  Define a function named initialize.
                  Set self.adj to empty map.
                  Define a function named add_vertex that takes v.
                  If v NOT in self.adj, then.
                  Set self.adj[v] to empty list.
                  End the if.
                  Define a function named add_edge that takes u, v, weight.
                  Call add_vertex(u).
                  Call add_vertex(v).
                  Append (v, weight) to self.adj[u].
                `),
                block(`
                  Create DirectedGraph with an empty adjacency map.
                  Define add_vertex(v) to create an empty outgoing list when needed.
                  Define add_edge(u, v, weight) to add both vertices and append the weighted outgoing edge from u.
                `),
                block(`
                  Build a directed weighted graph by storing outgoing edges in each vertex's adjacency list.
                `),
                block(`
                  CLASS DirectedGraph
                  FUNCTION initialize()
                  SET self.adj = empty map
                  FUNCTION add_vertex(v)
                  IF v NOT IN self.adj THEN
                  SET self.adj[v] = empty list
                  END IF
                  FUNCTION add_edge(u, v, weight)
                  CALL add_vertex(u)
                  CALL add_vertex(v)
                  APPEND (v, weight) TO self.adj[u]
                `)
              )
            ]
      ),
      topic(
        "directed-graph-reachability-and-path-search-with-bfs",
        "Reachability and path search with BFS",
        "In a directed graph, BFS still explores level by level, but only along outgoing edges.",
        "It is used for questions such as whether one state can reach another, how many transitions separate two states, or what the minimum number of directed steps is in an unweighted setting.",
        [
              example(
                "directed-graph-reachability-and-path-search-with-bfs-example",
                block(`
                  Define a function named directed_bfs that takes start, goal.
                  Create queue.
                  Enqueue start.
                  Set visited to {start}.
                  Set parent[start] to null.
                  While queue is not empty.
                  Set current to dequeue queue.
                  If current = goal, then.
                  Stop the current loop.
                  End the if.
                  For each (neighbor, weight) in self.adj[current].
                  If neighbor NOT in visited, then.
                  Add neighbor to visited.
                  Set parent[neighbor] to current.
                  Enqueue neighbor.
                  End the if.
                  End the for.
                  End the while.
                `),
                block(`
                  Define directed_bfs(start, goal).
                  Use a queue, visited set, and parent map starting from start.
                  Follow outgoing edges only while processing the queue.
                  Record parents for newly discovered neighbors until goal is reached.
                `),
                block(`
                  Use BFS on outgoing edges to test reachability and recover a directed path.
                `),
                block(`
                  FUNCTION directed_bfs(start, goal)
                  CREATE queue
                  ENQUEUE start
                  SET visited = {start}
                  SET parent[start] = null
                  WHILE queue IS NOT empty
                  SET current = DEQUEUE queue
                  IF current = goal THEN
                  BREAK END IF FOR EACH (neighbor, weight) IN self.adj[current] IF neighbor NOT IN visited THEN ADD
                  neighbor TO visited SET parent[neighbor] = current ENQUEUE neighbor END IF END FOR END WHILE
                `)
              )
            ]
      ),
      topic(
        "directed-graph-dijkstra",
        "Dijkstra for directed non-negative weighted graphs",
        "Dijkstra also works on directed graphs, as long as edge weights are non-negative.",
        "It is used when each directed edge has a cost, such as time, fuel, or penalty, and the task is to find the cheapest directed route from a source.",
        [
              example(
                "directed-graph-dijkstra-example",
                block(`
                  Define a function named dijkstra that takes start.
                  Initialize all distances to infinity.
                  Set distance[start] to 0.
                  Create priority_queue with (0, start).
                  While priority_queue is not empty.
                  Extract current vertex.
                  For each (neighbor, weight) in self.adj[current].
                  If distance[current] + weight < distance[neighbor], then.
                  Set distance[neighbor] to distance[current] + weight.
                  Set parent[neighbor] to current.
                  Insert (distance[neighbor], neighbor).
                  End the if.
                  End the for.
                  End the while.
                `),
                block(`
                  Define dijkstra(start).
                  Initialize distances and push start into the priority queue.
                  Repeatedly extract the current vertex and relax each outgoing weighted edge.
                  Update distance and parent whenever a shorter path is found.
                `),
                block(`
                  Run Dijkstra on the directed weighted graph from start.
                `),
                block(`
                  FUNCTION dijkstra(start)
                  INITIALIZE all distances to infinity
                  SET distance[start] = 0
                  CREATE priority_queue with (0, start)
                  WHILE priority_queue IS NOT empty
                  EXTRACT current vertex FOR EACH (neighbor, weight) IN self.adj[current] IF distance[current] +
                  weight < distance[neighbor] THEN SET distance[neighbor] = distance[current] + weight SET
                  parent[neighbor] = current INSERT (distance[neighbor], neighbor) END IF END FOR END WHILE
                `)
              )
            ]
      ),
      topic(
        "directed-graph-bellman-ford",
        "Bellman-Ford for directed graphs with negative edges",
        "Bellman-Ford computes shortest paths when directed edges may be negative, as long as no negative cycle is reachable from the source.",
        "It is used because Dijkstra can fail when a later negative edge should improve a path that was assumed to be settled too early. Bellman-Ford systematically relaxes every edge multiple times and can also detect negative cycles.",
        [
              example(
                "directed-graph-bellman-ford-example",
                block(`
                  Define a function named bellman_ford that takes start.
                  Initialize all distances to infinity.
                  Set distance[start] to 0.
                  Repeat |v| - 1 times.
                  For each edge (u, v, weight).
                  If distance[u] is not infinity and distance[u] + weight < distance[v], then.
                  Set distance[v] to distance[u] + weight.
                  Set parent[v] to u.
                  End the if.
                  End the for.
                  End the repeat.
                  For each edge (u, v, weight).
                  If distance[u] is not infinity and distance[u] + weight < distance[v], then.
                  Report negative_cycle.
                  End the if.
                  End the for.
                `),
                block(`
                  Define bellman_ford(start).
                  Initialize all distances to infinity except start.
                  Relax every edge |V| - 1 times, updating distance and parent.
                  Scan the edges one more time to detect any further improvement.
                  Report negative_cycle if one is found.
                `),
                block(`
                  Repeatedly relax all edges and then check once more for a negative cycle.
                `),
                block(`
                  FUNCTION bellman_ford(start)
                  INITIALIZE all distances to infinity
                  SET distance[start] = 0
                  REPEAT |V| - 1 TIMES FOR EACH edge (u, v, weight) IF distance[u] IS NOT infinity AND distance[u] +
                  weight < distance[v] THEN SET distance[v] = distance[u] + weight SET parent[v] = u END IF END FOR
                  END REPEAT FOR EACH edge (u, v, weight) IF distance[u] IS NOT infinity AND distance[u] + weight <
                  distance[v] THEN REPORT negative_cycle END IF END FOR
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "directed-acyclic-graph",
    6,
    "Directed Acyclic Graph (DAG)",
    "A DAG is a directed graph with no directed cycles. This restriction is powerful because it creates a partial order, which makes DAGs ideal for scheduling, prerequisite systems, build pipelines, and dependency management.",
    [
      topic(
        "dag-initialization-and-modeling-dependencies",
        "Initialization and modeling dependencies",
        "Initialization is the same as for a directed graph, but the graph is built under the rule that no directed cycle may be introduced.",
        "It is used because many real systems have one-way dependencies that must not loop back on themselves. If task A depends on task B, and task B depends on task A, the schedule is impossible.",
        [
              example(
                "dag-initialization-and-modeling-dependencies-example",
                block(`
                  Create a class named DAG.
                  Define a function named initialize.
                  Set self.adj to empty map.
                  Define a function named add_edge that takes u, v.
                  Call add_vertex(u).
                  Call add_vertex(v).
                  Append v to self.adj[u].
                `),
                block(`
                  Create DAG with an empty adjacency map.
                  Define add_edge(u, v) to ensure both vertices exist and then append v to u's list.
                `),
                block(`
                  Model dependencies as directed edges in a DAG adjacency map.
                `),
                block(`
                  CLASS DAG
                  FUNCTION initialize()
                  SET self.adj = empty map
                  FUNCTION add_edge(u, v)
                  CALL add_vertex(u)
                  CALL add_vertex(v)
                  APPEND v TO self.adj[u]
                `)
              )
            ]
      ),
      topic(
        "dag-topological-sort",
        "Topological sort",
        "A topological sort is an ordering of the vertices such that every edge goes from an earlier vertex to a later one.",
        "It is used whenever tasks must be completed in a legal order. In a DAG, topological order turns graph structure into an actual execution sequence.",
        [
              example(
                "dag-topological-sort-example",
                block(`
                  Define a function named topological_sort.
                  Compute in_degree of every vertex.
                  Create queue of all vertices with in_degree 0.
                  Create empty order list.
                  While queue is not empty.
                  Dequeue from current.
                  Append current to order.
                  For each neighbor in self.adj[current].
                  Decrease in_degree[neighbor] by 1.
                  If in_degree[neighbor] = 0, then.
                  Enqueue neighbor.
                  End the if.
                  End the for.
                  End the while.
                  Return order.
                `),
                block(`
                  Define topological_sort.
                  Compute in_degree for every vertex.
                  Queue all vertices with in_degree 0 and build order as they are removed.
                  Decrease neighbors' in_degree and enqueue any that become 0.
                  Return order.
                `),
                block(`
                  Produce a topological order by repeatedly removing vertices whose in-degree is 0.
                `),
                block(`
                  FUNCTION topological_sort()
                  COMPUTE in_degree of every vertex CREATE queue of all vertices with in_degree 0 CREATE empty
                  order list WHILE queue IS NOT empty DEQUEUE current APPEND current TO order FOR EACH
                  neighbor IN self.adj[current] DECREASE in_degree[neighbor] BY 1 IF in_degree[neighbor] = 0 THEN
                  ENQUEUE neighbor END IF END FOR END WHILE RETURN order
                `)
              )
            ]
      ),
      topic(
        "dag-shortest-path-unweighted",
        "Shortest path in an unweighted DAG",
        "An unweighted DAG can use topological order to relax edges once in the correct dependency order.",
        "It is used because the acyclic structure removes the need to revisit vertices endlessly. Once earlier dependencies are processed, later distances can be updated cleanly.",
        [
              example(
                "dag-shortest-path-unweighted-example",
                block(`
                  Define a function named dag_shortest_path_unweighted that takes start.
                  Set order to topological_sort().
                  Initialize all distances to infinity.
                  Set distance[start] to 0.
                  For each vertex in order.
                  If distance[vertex] is not infinity, then.
                  For each neighbor in self.adj[vertex].
                  If distance[vertex] + 1 < distance[neighbor], then.
                  Set distance[neighbor] to distance[vertex] + 1.
                  End the if.
                  End the for.
                  End the if.
                  End the for.
                `),
                block(`
                  Define dag_shortest_path_unweighted(start).
                  Get the topological order and initialize distances.
                  Process vertices in that order only when they are reachable.
                  Relax each outgoing edge with cost 1.
                `),
                block(`
                  Use topological order to compute unweighted shortest paths in a DAG.
                `),
                block(`
                  FUNCTION dag_shortest_path_unweighted(start)
                  SET order = topological_sort()
                  INITIALIZE all distances to infinity
                  SET distance[start] = 0
                  FOR EACH vertex IN order
                  IF distance[vertex] IS NOT infinity THEN
                  FOR EACH neighbor IN self.adj[vertex]
                  IF distance[vertex] + 1 < distance[neighbor] THEN
                  SET distance[neighbor] = distance[vertex] + 1
                  END IF
                  END FOR
                  END IF
                  END FOR
                `)
              )
            ]
      ),
      topic(
        "dag-shortest-path-weighted",
        "Shortest path in a weighted DAG",
        "A weighted DAG can compute shortest paths by processing vertices in topological order and relaxing weighted edges once.",
        "It is used because acyclicity removes the risk of revisiting a vertex due to a future cycle. This makes the algorithm simpler than Bellman-Ford and often faster than Dijkstra in DAG settings.",
        [
              example(
                "dag-shortest-path-weighted-example",
                block(`
                  Define a function named dag_shortest_path_weighted that takes start.
                  Set order to topological_sort().
                  Initialize all distances to infinity.
                  Set distance[start] to 0.
                  For each vertex in order.
                  If distance[vertex] is not infinity, then.
                  For each (neighbor, weight) in self.adj[vertex].
                  If distance[vertex] + weight < distance[neighbor], then.
                  Set distance[neighbor] to distance[vertex] + weight.
                  Set parent[neighbor] to vertex.
                  End the if.
                  End the for.
                  End the if.
                  End the for.
                `),
                block(`
                  Define dag_shortest_path_weighted(start).
                  Get the topological order and initialize distances.
                  Process each reachable vertex in order.
                  Relax each outgoing weighted edge and update parent when distance improves.
                `),
                block(`
                  Use topological order to compute weighted shortest paths in a DAG.
                `),
                block(`
                  FUNCTION dag_shortest_path_weighted(start)
                  SET order = topological_sort()
                  INITIALIZE all distances to infinity
                  SET distance[start] = 0
                  FOR EACH vertex IN order
                  IF distance[vertex] IS NOT infinity THEN
                  FOR EACH (neighbor, weight) IN self.adj[vertex]
                  IF distance[vertex] + weight < distance[neighbor] THEN
                  SET distance[neighbor] = distance[vertex] + weight
                  SET parent[neighbor] = vertex
                  END IF
                  END FOR
                  END IF
                  END FOR
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "heap",
    7,
    "Heap",
    "A heap is a tree-based priority structure usually stored in an array. In a min-heap, every parent is less than or equal to its children, so the smallest element stays at the root. In a max-heap, the largest element stays at the root.",
    [
      topic(
        "heap-initialization-with-a-heap-class",
        "Initialization with a heap class",
        "Initialization creates a class whose internal state is an array. The array is interpreted as a complete binary tree using index relationships rather than explicit node pointers.",
        "This is used because heaps are designed for fast access to the current minimum or maximum. An array representation is compact and lets parent-child navigation be computed by index formulas.",
        [
              example(
                "heap-initialization-with-a-heap-class-example",
                block(`
                  Create a class named MinHeap.
                  Define a function named initialize.
                  Set self.data to empty list.
                  Define a function named parent that takes i.
                  Return floor((i - 1) / 2).
                  Define a function named left that takes i.
                  Return 2*i + 1.
                  Define a function named right that takes i.
                  Return 2*i + 2.
                `),
                block(`
                  Create MinHeap with self.data as an empty list.
                  Define parent(i), left(i), and right(i) helper functions.
                  Use those helpers to navigate the array-based tree.
                `),
                block(`
                  Initialize an array-backed min-heap with index helpers for parent and children.
                `),
                block(`
                  CLASS MinHeap
                  FUNCTION initialize()
                  SET self.data = empty list
                  FUNCTION parent(i)
                  RETURN floor((i - 1) / 2)
                  FUNCTION left(i)
                  RETURN 2*i + 1
                  FUNCTION right(i)
                  RETURN 2*i + 2
                `)
              )
            ]
      ),
      topic(
        "heap-search-and-why-heaps-are-not-for-arbitrary-lookup",
        "Search and why heaps are not for arbitrary lookup",
        "A heap guarantees order only between parents and children, not across the entire array. Because of that, searching for an arbitrary value is generally linear.",
        "This matters because students often assume every ordered structure supports fast lookup. A heap is optimized for priority operations, not membership search. Its strength is at the root, not everywhere.",
        [
              example(
                "heap-search-and-why-heaps-are-not-for-arbitrary-lookup-example",
                block(`
                  Define a function named contains that takes target.
                  For each value in self.data.
                  If value = target, then.
                  Return true.
                  End the if.
                  End the for.
                  Return false.
                `),
                block(`
                  Define contains(target).
                  Scan every value in self.data.
                  Return true when target is found, otherwise return false after the scan.
                `),
                block(`
                  Search a heap linearly when you need arbitrary lookup.
                `),
                block(`
                  FUNCTION contains(target)
                  FOR EACH value IN self.data
                  IF value = target THEN
                  RETURN true
                  END IF
                  END FOR
                  RETURN false
                `)
              )
            ]
      ),
      topic(
        "heap-insert-with-sift-up",
        "Insert with sift-up",
        "Insert adds the new value at the end of the array and then repeatedly swaps it with its parent until the heap property is restored.",
        "It is used whenever a new task, score, or priority enters the system. Sift-up keeps the structure complete while restoring correct priority order.",
        [
              example(
                "heap-insert-with-sift-up-example",
                block(`
                  Define a function named insert that takes value.
                  Append value to self.data.
                  Set i to last index of self.data.
                  While i > 0 and self.data[i] < self.data[parent(i)].
                  Swap self.data[i] and self.data[parent(i)].
                  Set i to parent(i).
                  End the while.
                `),
                block(`
                  Define insert(value).
                  Append value and start at the last index.
                  While the new value is smaller than its parent, swap upward.
                `),
                block(`
                  Insert into the heap by appending and sifting the new value upward.
                `),
                block(`
                  FUNCTION insert(value)
                  APPEND value TO self.data SET i = last index of self.data WHILE i > 0 AND self.data[i] <
                  self.data[parent(i)] SWAP self.data[i] AND self.data[parent(i)] SET i = parent(i) END WHILE
                `)
              )
            ]
      ),
      topic(
        "heap-delete-root-with-sift-down",
        "Delete root with sift-down",
        "Deleting the root of a heap removes the current minimum or maximum. The last element is moved to the root and then pushed downward until the heap property is restored.",
        "This is used in scheduling and priority queues because the structure must repeatedly return and remove the most urgent or smallest item.",
        [
              example(
                "heap-delete-root-with-sift-down-example",
                block(`
                  Define a function named extract_min.
                  If self.data is empty, then.
                  Return not_found.
                  End the if.
                  Set answer to self.data[0].
                  Move last element to index 0.
                  Remove last array position.
                  Call sift_down(0).
                  Return answer.
                  Define a function named sift_down that takes i.
                  While true.
                  Set smallest to i.
                  If left(i) EXISTS and self.data[left(i)] < self.data[smallest], then.
                  Set smallest to left(i).
                  End the if.
                  If right(i) EXISTS and self.data[right(i)] < self.data[smallest], then.
                  Set smallest to right(i).
                  End the if.
                  If smallest = i, then.
                  Stop the current loop.
                  End the if.
                  Swap self.data[i] and self.data[smallest].
                  Set i to smallest.
                  End the while.
                `),
                block(`
                  Define extract_min.
                  Handle the empty heap, save the root, move the last element to index 0, remove the last slot, and sift down.
                  Define sift_down(i) to compare with both children, swap with the smaller child, and stop when heap order is restored.
                `),
                block(`
                  Remove the min element, move the last value to the root, and sift it down until heap order returns.
                `),
                block(`
                  FUNCTION extract_min()
                  IF self.data IS empty THEN
                  RETURN not_found
                  END IF
                  SET answer = self.data[0]
                  MOVE last element to index 0 REMOVE last array position CALL sift_down(0) RETURN answer
                  FUNCTION sift_down(i) WHILE true SET smallest = i IF left(i) EXISTS AND self.data[left(i)] <
                  self.data[smallest] THEN SET smallest = left(i) END IF IF right(i) EXISTS AND self.data[right(i)] <
                  self.data[smallest] THEN SET smallest = right(i) END IF IF smallest = i THEN BREAK END IF SWAP
                  self.data[i] AND self.data[smallest] SET i = smallest END WHILE
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "sorting-algorithms",
    8,
    "Sorting Algorithms",
    "Sorting places values into a chosen order, usually ascending or descending. Different sorting methods reflect different strategies: local swapping, repeated selection, gradual insertion into a sorted region, divide-and-conquer merging, and digit-by-digit grouping.",
    [
      topic(
        "sorting-bubble-sort",
        "Bubble sort",
        "Bubble sort repeatedly compares neighboring elements and swaps them when they are out of order. Larger values gradually move toward the end of the list, like bubbles rising upward.",
        "It is used mainly as a teaching algorithm because it makes local improvement visible. It is easy to understand but inefficient on large inputs because it performs many repeated comparisons.",
        [
              example(
                "sorting-bubble-sort-example",
                block(`
                  Define a function named bubble_sort that takes A.
                  For pass from 1 to length(a) - 1.
                  Set swapped to false.
                  For i from 0 to length(a) - 2.
                  If A[i] > A[i+1], then.
                  Swap A[i] and A[i+1].
                  Set swapped to true.
                  End the if.
                  End the for.
                  If swapped = false, then.
                  Stop the current loop.
                  End the if.
                  End the for.
                `),
                block(`
                  Define bubble_sort(A).
                  Repeat passes through the array, swapping adjacent out-of-order pairs.
                  Track whether any swap happened on the pass.
                  Stop early when a pass makes no swaps.
                `),
                block(`
                  Repeatedly swap adjacent out-of-order pairs until the array is sorted.
                `),
                block(`
                  FUNCTION bubble_sort(A)
                  FOR pass FROM 1 TO length(A) - 1
                  SET swapped = false
                  FOR i FROM 0 TO length(A) - 2
                  IF A[i] > A[i+1] THEN
                  SWAP A[i] AND A[i+1]
                  SET swapped = true
                  END IF
                  END FOR
                  IF swapped = false THEN
                  BREAK END IF END FOR
                `)
              )
            ]
      ),
      topic(
        "sorting-selection-sort",
        "Selection sort",
        "Selection sort repeatedly finds the smallest remaining unsorted value and places it into the next correct position.",
        "It is used because it separates the sorted prefix from the unsorted suffix very clearly. Like bubble sort, it is mostly pedagogical, but it teaches the idea of repeatedly selecting the next best candidate.",
        [
              example(
                "sorting-selection-sort-example",
                block(`
                  Define a function named selection_sort that takes A.
                  For i from 0 to length(a) - 1.
                  Set min_index to i.
                  For j from i+1 to length(a) - 1.
                  If A[j] < A[min_index], then.
                  Set min_index to j.
                  End the if.
                  End the for.
                  Swap A[i] and A[min_index].
                  End the for.
                `),
                block(`
                  Define selection_sort(A).
                  For each position i, find the smallest remaining value to the right.
                  Swap that minimum into position i.
                `),
                block(`
                  Repeatedly select the smallest remaining value and place it next.
                `),
                block(`
                  FUNCTION selection_sort(A)
                  FOR i FROM 0 TO length(A) - 1
                  SET min_index = i
                  FOR j FROM i+1 TO length(A) - 1
                  IF A[j] < A[min_index] THEN
                  SET min_index = j
                  END IF
                  END FOR
                  SWAP A[i] AND A[min_index]
                  END FOR
                `)
              )
            ]
      ),
      topic(
        "sorting-insertion-sort",
        "Insertion sort",
        "Insertion sort builds a sorted region from left to right. Each new value is inserted into the correct position within the portion that is already sorted.",
        "It is used because it performs very well on small inputs and nearly sorted data. It also matches the way many people sort cards in their hands, so the mental model feels natural.",
        [
              example(
                "sorting-insertion-sort-example",
                block(`
                  Define a function named insertion_sort that takes A.
                  For i from 1 to length(a) - 1.
                  Set key to a[i].
                  Set j to i - 1.
                  While j >= 0 and A[j] > key.
                  Set a[j+1] to a[j].
                  Set j to j - 1.
                  End the while.
                  Set a[j+1] to key.
                  End the for.
                `),
                block(`
                  Define insertion_sort(A).
                  Take each new key from left to right.
                  Shift larger earlier values one position right.
                  Insert the key into the gap that remains.
                `),
                block(`
                  Grow a sorted prefix by shifting larger values right and inserting the current key.
                `),
                block(`
                  FUNCTION insertion_sort(A)
                  FOR i FROM 1 TO length(A) - 1
                  SET key = A[i]
                  SET j = i - 1
                  WHILE j >= 0 AND A[j] > key
                  SET A[j+1] = A[j]
                  SET j = j - 1
                  END WHILE
                  SET A[j+1] = key
                  END FOR
                `)
              )
            ]
      ),
      topic(
        "sorting-merge-sort",
        "Merge sort",
        "Merge sort divides the list into smaller halves, sorts each half recursively, and then merges the sorted halves back together.",
        "It is used because divide-and-conquer gives predictable efficiency and stable behavior. It is especially valuable when reliable performance matters more than in-place memory savings.",
        [
              example(
                "sorting-merge-sort-example",
                block(`
                  Define a function named merge_sort that takes A.
                  If length(A) <= 1, then.
                  Return A.
                  End the if.
                  Set mid to floor(length(a) / 2).
                  Set left to merge_sort(first half of a).
                  Set right to merge_sort(second half of a).
                  Return merge(left, right).
                  Define a function named merge that takes left, right.
                  Create empty result.
                  While left NOT empty and right NOT empty.
                  If first(left) <= first(right), then.
                  Move first(left) to result.
                  Otherwise.
                  Move first(right) to result.
                  End the if.
                  End the while.
                  Append remaining items to result.
                  Return result.
                `),
                block(`
                  Define merge_sort(A).
                  Return A immediately when its length is 1 or less.
                  Split A into halves, recursively sort each half, and merge the sorted results.
                  Define merge(left, right) to repeatedly move the smaller front item into result, then append the remainder.
                `),
                block(`
                  Recursively split the array, sort both halves, and merge them back together.
                `),
                block(`
                  FUNCTION merge_sort(A)
                  IF length(A) <= 1 THEN
                  RETURN A
                  END IF
                  SET mid = floor(length(A) / 2)
                  SET left = merge_sort(first half of A)
                  SET right = merge_sort(second half of A)
                  RETURN merge(left, right)
                  FUNCTION merge(left, right)
                  CREATE empty result
                  WHILE left NOT empty AND right NOT empty
                  IF first(left) <= first(right) THEN
                  MOVE first(left) TO result ELSE MOVE first(right) TO result END IF END WHILE APPEND remaining
                  items to result RETURN result
                `)
              )
            ]
      ),
      topic(
        "sorting-radix-sort",
        "Radix sort",
        "Radix sort sorts numbers digit by digit, usually from least significant digit to most significant digit, using a stable grouping step at each digit position.",
        "It is used when keys are integers or strings with a fixed alphabetic or numeric structure. Instead of comparing whole values directly, it organizes them by parts. This can be very efficient in the right setting.",
        [
              example(
                "sorting-radix-sort-example",
                block(`
                  Define a function named radix_sort that takes A.
                  Set max_digits to number of digits in the largest value.
                  For digit_position from 1 to max_digits.
                  Place each value into bucket based on its current digit.
                  Collect buckets back into a in bucket order.
                  End the for.
                `),
                block(`
                  Define radix_sort(A).
                  Find how many digit positions the largest value has.
                  For each digit position, bucket values by that digit and collect the buckets back into A.
                `),
                block(`
                  Sort numbers digit by digit, from least significant to most significant.
                `),
                block(`
                  FUNCTION radix_sort(A)
                  SET max_digits = number of digits in the largest value
                  FOR digit_position FROM 1 TO max_digits
                  PLACE each value into bucket based on its current digit COLLECT buckets back into A in bucket order
                  END FOR
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "greedy-algorithms",
    9,
    "Greedy Algorithms",
    "A greedy algorithm makes the best-looking local choice at each step and does not reconsider that choice later. Greedy methods are powerful when a problem has a structure that guarantees local decisions build a global optimum.",
    [
      topic(
        "greedy-activity-selection",
        "Activity selection",
        "The activity selection problem asks for the maximum number of non-overlapping activities. The classic greedy rule is to keep choosing the activity that finishes first among those still available.",
        "It is used because finishing early leaves as much room as possible for future activities. This is a case where the locally best decision provably supports the globally best schedule.",
        [
              example(
                "greedy-activity-selection-example",
                block(`
                  Define a function named activity_selection that takes activities.
                  Sort activities by finish time.
                  Create empty answer.
                  Set last_finish to -infinity.
                  For each activity in activities.
                  If activity.start >= last_finish, then.
                  Append activity to answer.
                  Set last_finish to activity.finish.
                  End the if.
                  End the for.
                  Return answer.
                `),
                block(`
                  Define activity_selection(activities).
                  Sort the activities by finish time.
                  Walk through them in that order and choose an activity whenever its start is at least the last chosen finish.
                  Return the chosen set.
                `),
                block(`
                  Greedily keep the earliest-finishing compatible activities.
                `),
                block(`
                  FUNCTION activity_selection(activities)
                  SORT activities by finish time
                  CREATE empty answer
                  SET last_finish = -infinity
                  FOR EACH activity IN activities
                  IF activity.start >= last_finish THEN
                  APPEND activity TO answer SET last_finish = activity.finish END IF END FOR RETURN answer
                `)
              )
            ]
      ),
      topic(
        "greedy-fractional-knapsack",
        "Fractional knapsack",
        "In fractional knapsack, each item has value and weight, and fractions of items may be taken. The greedy rule is to take as much as possible of the item with highest value-to-weight ratio first.",
        "It is used because every partial unit of an item contributes proportionally. That proportional structure is exactly what makes the greedy choice correct here, unlike in the 0-1 version where items are indivisible.",
        [
              example(
                "greedy-fractional-knapsack-example",
                block(`
                  Define a function named fractional_knapsack that takes items, capacity.
                  Sort items by value_per_weight in descending order.
                  Set total_value to 0.
                  For each item in items.
                  If capacity = 0, then.
                  Stop the current loop.
                  End the if.
                  If item.weight <= capacity, then.
                  Take all of item.
                  Decrease capacity by item.weight.
                  Increase total_value by item.value.
                  Otherwise.
                  Take fraction = capacity / item.weight of item.
                  Increase total_value by fraction * item.value.
                  Set capacity to 0.
                  End the if.
                  End the for.
                  Return total_value.
                `),
                block(`
                  Define fractional_knapsack(items, capacity).
                  Sort items by value_per_weight descending.
                  Take each whole item while it fits.
                  When the next item no longer fits, take only the needed fraction and stop.
                  Return total_value.
                `),
                block(`
                  Greedily fill the knapsack by value density, taking a fraction of the last item if needed.
                `),
                block(`
                  FUNCTION fractional_knapsack(items, capacity)
                  SORT items by value_per_weight in descending order
                  SET total_value = 0
                  FOR EACH item IN items
                  IF capacity = 0 THEN
                  BREAK END IF IF item.weight <= capacity THEN TAKE all of item DECREASE capacity by item.weight
                  INCREASE total_value by item.value ELSE TAKE fraction = capacity / item.weight of item INCREASE
                  total_value by fraction * item.value SET capacity = 0 END IF END FOR RETURN total_value
                `)
              )
            ]
      ),
      topic(
        "greedy-huffman-coding",
        "Huffman coding",
        "Huffman coding builds an optimal prefix code by repeatedly combining the two least frequent symbols into a new tree node.",
        "It is used in compression because frequent symbols should get shorter codes and rare symbols can tolerate longer ones. The greedy choice of merging the two least frequent symbols is what makes the final code optimal.",
        [
              example(
                "greedy-huffman-coding-example",
                block(`
                  Define a function named huffman that takes frequencies.
                  Create min_heap of one-node trees keyed by frequency.
                  While heap size > 1.
                  Extract smallest tree x.
                  Extract smallest tree y.
                  Create new parent with weight x.weight + y.weight.
                  Set parent.left to x.
                  Set parent.right to y.
                  Insert parent back into heap.
                  End the while.
                  Return remaining tree.
                `),
                block(`
                  Define huffman(frequencies).
                  Create a min-heap of one-node trees.
                  Repeatedly remove the two lightest trees, join them under a new parent, and push that parent back.
                  Return the final remaining tree.
                `),
                block(`
                  Build the Huffman tree by repeatedly merging the two least frequent trees.
                `),
                block(`
                  FUNCTION huffman(frequencies)
                  CREATE min_heap of one-node trees keyed by frequency
                  WHILE heap size > 1
                  EXTRACT smallest tree x EXTRACT smallest tree y CREATE new parent with weight x.weight + y.weight
                  SET parent.left = x SET parent.right = y INSERT parent back into heap END WHILE RETURN remaining
                  tree
                `)
              )
            ]
      ),
      topic(
        "greedy-minimum-spanning-tree-with-kruskals-idea",
        "Minimum spanning tree with Kruskal's idea",
        "A minimum spanning tree connects all vertices in a weighted undirected graph using the smallest possible total edge weight without creating cycles. Kruskal's greedy rule adds the smallest safe edge next.",
        "It is used in network design because it minimizes total wiring, road cost, or infrastructure cost while still keeping the system connected. The key is that an edge is chosen only if it does not form a cycle with edges already chosen.",
        [
              example(
                "greedy-minimum-spanning-tree-with-kruskals-idea-example",
                block(`
                  Define a function named kruskal that takes vertices, edges.
                  Sort edges by weight.
                  Make each vertex its own set.
                  Create empty tree_edges.
                  For each edge (u, v, w) in sorted edges.
                  If find(u) != find(v), then.
                  Append edge to tree_edges.
                  Union sets of u and v.
                  End the if.
                  End the for.
                  Return tree_edges.
                `),
                block(`
                  Define kruskal(vertices, edges).
                  Sort edges by weight and place each vertex in its own set.
                  Scan edges from lightest to heaviest.
                  Add an edge only when its endpoints are in different sets, then union those sets.
                  Return tree_edges.
                `),
                block(`
                  Build the MST by adding the lightest edges that do not create a cycle.
                `),
                block(`
                  FUNCTION kruskal(vertices, edges)
                  SORT edges by weight
                  MAKE each vertex its own set CREATE empty tree_edges FOR EACH edge (u, v, w) IN sorted edges IF
                  find(u) != find(v) THEN APPEND edge TO tree_edges UNION sets of u and v END IF END FOR RETURN
                  tree_edges
                `)
              )
            ]
      ),
    ]
  ),
  lesson(
    "dynamic-programming",
    10,
    "Dynamic Programming",
    "Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing smaller answers and reusing them. The main design questions are always the same: what is the state, what is the recurrence, and in what order should states be filled?",
    [
      topic(
        "dynamic-programming-zero-one-knapsack",
        "0-1 Knapsack",
        "In 0-1 knapsack, each item may either be taken whole or left behind. The state usually records how many items have been considered and how much capacity remains or has already been used.",
        "It is used because greedy choice fails in the 0-1 setting. Dynamic programming works by comparing two possibilities for each item: skip it or take it, then reusing those smaller decisions.",
        [
              example(
                "dynamic-programming-zero-one-knapsack-example",
                block(`
                  Define a function named zero_one_knapsack that takes weights, values, capacity.
                  Create table dp with rows for items and columns 0..capacity.
                  For i from 1 to number_of_items.
                  For c from 0 to capacity.
                  Set dp[i][c] to dp[i-1][c].
                  If weights[i] <= c, then.
                  Set dp[i][c] to max(dp[i][c], values[i] + dp[i-1][c - weights[i]]).
                  End the if.
                  End the for.
                  End the for.
                  Return dp[number_of_items][capacity].
                `),
                block(`
                  Define zero_one_knapsack(weights, values, capacity).
                  Create a DP table over items and capacities.
                  For each item and capacity, start from the skip case.
                  If the item fits, compare skipping it with taking it.
                  Return the value at the final state.
                `),
                block(`
                  Fill a DP table that decides, for each item and capacity, whether skipping or taking the item is better.
                `),
                block(`
                  FUNCTION zero_one_knapsack(weights, values, capacity)
                  CREATE table dp with rows for items and columns 0..capacity
                  FOR i FROM 1 TO number_of_items
                  FOR c FROM 0 TO capacity
                  SET dp[i][c] = dp[i-1][c]
                  IF weights[i] <= c THEN
                  SET dp[i][c] = max(dp[i][c], values[i] + dp[i-1][c - weights[i]])
                  END IF
                  END FOR
                  END FOR
                  RETURN dp[number_of_items][capacity]
                `)
              )
            ]
      ),
      topic(
        "dynamic-programming-unbounded-knapsack",
        "Unbounded Knapsack",
        "In unbounded knapsack, an item may be used more than once. The recurrence changes because the current item can remain available after it is chosen.",
        "It is used for production, coin-style packing, and resource allocation problems where repeating an item is legal. The central lesson is that a small change in problem rules changes the recurrence completely.",
        [
              example(
                "dynamic-programming-unbounded-knapsack-example",
                block(`
                  Define a function named unbounded_knapsack that takes weights, values, capacity.
                  Create array dp[0..capacity] initialized to 0.
                  For c from 0 to capacity.
                  For each item i.
                  If weights[i] <= c, then.
                  Set dp[c] to max(dp[c], values[i] + dp[c - weights[i]]).
                  End the if.
                  End the for.
                  End the for.
                  Return dp[capacity].
                `),
                block(`
                  Define unbounded_knapsack(weights, values, capacity).
                  Create a 1D DP array from 0 to capacity.
                  For each capacity, test every item that fits.
                  Update dp[c] using the best value after taking that item again.
                  Return dp[capacity].
                `),
                block(`
                  Use dynamic programming over capacity, allowing the same item to be reused.
                `),
                block(`
                  FUNCTION unbounded_knapsack(weights, values, capacity)
                  CREATE array dp[0..capacity] initialized to 0
                  FOR c FROM 0 TO capacity
                  FOR EACH item i
                  IF weights[i] <= c THEN
                  SET dp[c] = max(dp[c], values[i] + dp[c - weights[i]])
                  END IF
                  END FOR
                  END FOR
                  RETURN dp[capacity]
                `)
              )
            ]
      ),
      topic(
        "dynamic-programming-longest-common-subsequence",
        "Longest Common Subsequence (LCS)",
        "The longest common subsequence problem asks for the longest sequence of symbols that appears in the same relative order in two strings, not necessarily contiguously.",
        "It is used in diff tools, bioinformatics, and version comparison because it measures shared structure rather than exact matching blocks. The state compares prefixes of the two strings.",
        [
              example(
                "dynamic-programming-longest-common-subsequence-example",
                block(`
                  Define a function named lcs that takes X, Y.
                  Create table dp with size (length(x)+1) by (length(y)+1).
                  For i from 1 to length(x).
                  For j from 1 to length(y).
                  If X[i] = Y[j], then.
                  Set dp[i][j] to 1 + dp[i-1][j-1].
                  Otherwise.
                  Set dp[i][j] to max(dp[i-1][j], dp[i][j-1]).
                  End the if.
                  End the for.
                  End the for.
                  Return dp[length(X)][length(Y)].
                `),
                block(`
                  Define lcs(X, Y).
                  Create a DP table over prefixes of X and Y.
                  For each pair of positions, extend the diagonal when the symbols match.
                  Otherwise take the larger value from the cell above or left.
                  Return the final table entry.
                `),
                block(`
                  Fill a DP table over both strings to compute the length of their longest common subsequence.
                `),
                block(`
                  FUNCTION lcs(X, Y)
                  CREATE table dp with size (length(X)+1) by (length(Y)+1)
                  FOR i FROM 1 TO length(X)
                  FOR j FROM 1 TO length(Y)
                  IF X[i] = Y[j] THEN
                  SET dp[i][j] = 1 + dp[i-1][j-1]
                  ELSE
                  SET dp[i][j] = max(dp[i-1][j], dp[i][j-1])
                  END IF
                  END FOR
                  END FOR
                  RETURN dp[length(X)][length(Y)]
                `)
              )
            ]
      ),
      topic(
        "dynamic-programming-longest-increasing-subsequence",
        "Longest Increasing Subsequence (LIS)",
        "The longest increasing subsequence problem asks for the longest subsequence of numbers that increases strictly from left to right.",
        "It is used because it teaches how to reason about sequences where local comparisons affect future potential. A classic dynamic program lets each position ask: what is the best increasing subsequence ending here?",
        [
              example(
                "dynamic-programming-longest-increasing-subsequence-example",
                block(`
                  Define a function named lis that takes A.
                  Create array dp of length(a), initialized to 1.
                  For i from 0 to length(a) - 1.
                  For j from 0 to i - 1.
                  If A[j] < A[i], then.
                  Set dp[i] to max(dp[i], dp[j] + 1).
                  End the if.
                  End the for.
                  End the for.
                  Return maximum value in dp.
                `),
                block(`
                  Define lis(A).
                  Create dp so every position starts with length 1.
                  For each i, compare against all earlier j.
                  When A[j] < A[i], update dp[i] from dp[j] + 1.
                  Return the maximum value in dp.
                `),
                block(`
                  Compute the best increasing subsequence ending at each position and return the largest one.
                `),
                block(`
                  FUNCTION lis(A)
                  CREATE array dp of length(A), initialized to 1
                  FOR i FROM 0 TO length(A) - 1
                  FOR j FROM 0 TO i - 1
                  IF A[j] < A[i] THEN
                  SET dp[i] = max(dp[i], dp[j] + 1)
                  END IF
                  END FOR
                  END FOR
                  RETURN maximum value in dp
                `)
              )
            ]
      ),
      topic(
        "dynamic-programming-matrix-chain-multiplication",
        "Matrix Chain Multiplication",
        "Matrix chain multiplication asks how to parenthesize a product of matrices so the total number of scalar multiplications is minimized.",
        "It is used because multiplication order changes cost dramatically even though the final mathematical product stays the same. Dynamic programming compares all possible split points of each subchain and stores the cheapest one.",
        [
              example(
                "dynamic-programming-matrix-chain-multiplication-example",
                block(`
                  Define a function named matrix_chain_order that takes p.
                  Let n = number of matrices.
                  Create table dp[n][n].
                  For chain_length from 2 to n.
                  For i from 1 to n - chain_length + 1.
                  Set j to i + chain_length - 1.
                  Set dp[i][j] to infinity.
                  For k from i to j - 1.
                  Set cost to dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j].
                  Set dp[i][j] to min(dp[i][j], cost).
                  End the for.
                  End the for.
                  End the for.
                  Return dp[1][n].
                `),
                block(`
                  Define matrix_chain_order(p).
                  Create a DP table for all matrix subchains.
                  Process chains in increasing length.
                  For each subchain, try every split point k and keep the cheapest multiplication cost.
                  Return dp[1][n].
                `),
                block(`
                  Use dynamic programming to test every split of each matrix subchain and keep the minimum cost.
                `),
                block(`
                  FUNCTION matrix_chain_order(p)
                  LET n = number of matrices CREATE table dp[n][n] FOR chain_length FROM 2 TO n FOR i FROM 1 TO n -
                  chain_length + 1 SET j = i + chain_length - 1 SET dp[i][j] = infinity FOR k FROM i TO j - 1 SET cost = dp[i]
                  [k] + dp[k+1][j] + p[i-1] * p[k] * p[j] SET dp[i][j] = min(dp[i][j], cost) END FOR END FOR END FOR RETURN
                  dp[1][n]
                `)
              )
            ]
      ),
    ]
  ),
];
