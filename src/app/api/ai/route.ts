import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const trimmed = prompt.trim();
    let command = 'chat';
    let query = trimmed;

    if (trimmed.startsWith('/')) {
      const parts = trimmed.split(' ');
      command = parts[0].substring(1);
      query = parts.slice(1).join(' ');
    }

    // Synthesis engine based on command
    let response = '';

    if (command === 'explain-concept' || query.toLowerCase().includes('3nf') || query.toLowerCase().includes('normalization')) {
      response = `### Bernstein 3NF Synthesis & Functional Dependency Analysis

**1. Candidate Key Determination**:
To determine whether a relational schema $R(A, B, C, D)$ is in 3NF, we evaluate the minimal cover $F_{min}$ of functional dependencies:
- A relation $R$ is in **3NF** if for every non-trivial dependency $X \\rightarrow Y$, either:
  1. $X$ is a **Superkey**, OR
  2. Every attribute in $Y \\setminus X$ is a **Prime Attribute** (part of some candidate key).

**2. Bernstein Synthesis Algorithm**:
1. Compute the **Canonical Cover (Minimal Cover)** $F_c$ of $F$.
2. For each dependency $X \\rightarrow A$ in $F_c$, form a relation schema $R_i = X \\cup \\{A\\}$.
3. If no generated schema contains a candidate key of the original relation $R$, create an additional relation schema consisting solely of an arbitrary candidate key $K$.
4. Eliminate redundant schemas (any $R_j \\subseteq R_k$).

**Verification Result**: Lossless-join guaranteed and dependency preservation guaranteed.`;
    } else if (command === 'solve-pyq' || query.toLowerCase().includes('pyq') || query.toLowerCase().includes('b+ tree')) {
      response = `### Solved University Examination Problem (CS-301 / GATE 2024)

**Problem Formulation**:
A B+ Tree index with block size $B = 4096$ bytes, search key size $K = 12$ bytes, and block pointer size $P = 8$ bytes. Calculate maximum fan-out and leaf node record capacity.

**Step-by-Step Derivation**:
1. **Internal Node Order ($p$)**:
   $p \\cdot P + (p - 1) \\cdot K \\le B$
   $8p + 12(p - 1) \\le 4096$
   $20p - 12 \\le 4096 \\implies 20p \\le 4108 \\implies p \\le 205.4$
   **Maximum Fan-out (Order $p$) = 205 pointers**.

2. **Leaf Node Capacity**:
   Assuming record pointer $R = 8$ bytes:
   $m \\cdot (K + R) + P_{next} \\le B$
   $m \\cdot (12 + 8) + 8 \\le 4096$
   $20m \\le 4088 \\implies m \\le 204.4$
   **Maximum Records per Leaf Page = 204 keys**.`;
    } else if (command === 'debug-code' || query.toLowerCase().includes('raft') || query.toLowerCase().includes('partition')) {
      response = `### Raft Consensus Log Invariant Verification

**Identified Issue**:
Under asymmetric network partition (e.g. Node 1, 2 partitioned from Nodes 3, 4, 5):
- The partitioned leader (Node 1) continues accepting uncommitted client writes in Term $T$.
- However, since it cannot reach a **Quorum ($N/2 + 1 = 3$)**, these log entries remain uncommitted.
- When Node 3 detects an election timeout, it increments Term to $T+1$ and receives votes from Nodes 4 and 5.

**Corrective Invariant**:
Ensure that upon partition reconciliation, Node 1 receives Heartbeat (AppendEntries) with Term $T+1$. It immediately steps down to Follower, adopts Term $T+1$, and overwrites conflicting uncommitted logs starting at the match index.`;
    } else if (command === 'simulate-attendance') {
      response = `### Attendance Impact Telemetry Simulation
- **Subject**: CS-301 Database Management Systems
- **Current Attendance**: 84.6% (38 of 45 sessions)
- **Simulated Impact (+2 Misses)**: New Rate = 79.1%
- **Safety Margin**: +4.1% above statutory 75.0% threshold
- **Permissible Misses Left**: Strictly **2 more lectures** before debarment warning.`;
    } else if (command === 'quiz-me' || query.toLowerCase().includes('avl') || query.toLowerCase().includes('tree')) {
      response = `### Spaced Retrieval Quiz: Balanced Search Trees

**Question 1**:
In an AVL tree, after inserting a node into the left subtree of the right child of node $A$ (RL condition), which sequence of rotations restores the balance invariant?
- A) Single Right Rotation
- B) Single Left Rotation
- C) Right rotation on right child, followed by Left rotation on $A$
- D) Left rotation on left child, followed by Right rotation on $A$

*NIVORA Answer Key*: **C** (Double Rotation: RL requires Right on child, then Left on parent).`;
    } else {
      response = `### NIVORA Academic Copilot Synthesis
Analyzing query against student graph (**B.Tech CSE Year 3, Sem 5**):

Your query: **"${trimmed}"**

**Immediate Academic Insights**:
1. **Curriculum Alignment**: Connected to CS-301 (DBMS) and CS-302 (DSA).
2. **Deliverable Context**: DBMS Assignment 03 is due tomorrow at 11:59 PM.
3. **Telemetry Advisory**: You have a 45-minute scheduled study block on this in your Planner.

*Try slash commands like \`/explain-concept [topic]\`, \`/solve-pyq [question]\`, or \`/simulate-attendance\` for instant formal derivations.*`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
