export const GROUPS_DATA = [
  {
    id:1, emoji:"⚡", name:"Algorithms & DS", course:"CS301", color:"#38bdf8",
    members:8, tags:["Sorting","Graphs","Trees"], next:"Today 6PM", live:true, meetLinks:[],
    desc:"Deep dives into algorithmic thinking. LeetCode hard problems, complexity proofs, and interview prep every week.",
    notes: [
      { id:101, title:"Binary Search Trees",  by:"Alex K.",  when:"2h ago",  content:`# Binary Search Tree\n\n## Core Definition\nA **BST** ensures left < parent < right at every node.\n\n## Time Complexity\n| Operation | Average  | Worst |\n|-----------|----------|-------|\n| Search    | O(log n) | O(n)  |\n| Insert    | O(log n) | O(n)  |\n\n## Key Insight\nBalanced variants (**AVL**, **Red-Black**) guarantee O(log n) always.\n\n## In-Order Traversal\nYields a **sorted sequence** — useful for validation.` },
      { id:102, title:"Graph BFS & DFS",      by:"Nav P.",   when:"1d ago",  content:`# Graph Traversal\n\n## BFS — Breadth First\n- Uses a **queue**\n- Finds **shortest path** in unweighted graphs\n- O(V + E) time\n\n## DFS — Depth First\n- Uses a **stack** (or recursion)\n- Good for **cycle detection**, topological sort\n- O(V + E) time\n\n## When to use which?\n> *BFS for shortest path. DFS for exploring everything.*` },
      { id:103, title:"Big-O Cheat Sheet",    by:"Alex K.",  when:"3d ago",  content:`# Big-O Reference\n\n## Common Complexities\n| Name | Notation | Example |\n|------|----------|---------|\n| Constant | O(1) | Array access |\n| Log | O(log n) | Binary search |\n| Linear | O(n) | Loop |\n| Linearithmic | O(n log n) | Merge sort |\n| Quadratic | O(n²) | Bubble sort |\n\n## Space vs Time\nAlways consider both — sometimes you trade one for the other.` },
    ],
    resources: [
      { id:101, name:"Big-O Complexity Sheet",  ext:"PDF",      size:"1.2 MB", upvotes:67, by:"Alex K.",  ago:"2d", voted:false },
      { id:102, name:"Sorting Animations",      ext:"VIDEO",    size:"22 MB",  upvotes:55, by:"Nav P.",   ago:"1d", voted:false },
      { id:103, name:"LeetCode Patterns Guide", ext:"PDF",      size:"3.1 MB", upvotes:88, by:"Sam T.",   ago:"4d", voted:false },
    ],
  },
  {
    id:2, emoji:"🧪", name:"Organic Chemistry", course:"CHEM201", color:"#2dd4bf",
    members:5, tags:["Reactions","Mechanisms"], next:"Fri 4PM", live:false, meetLinks:[],
    desc:"Pre-med group covering SN1/SN2, spectroscopy, and lab reports. Past exams shared freely.",
    notes: [
      { id:201, title:"SN1 vs SN2 Reactions",  by:"Priya M.", when:"5h ago",  content:`# SN1 vs SN2 Mechanisms\n\n## SN1 (Unimolecular)\n- Rate = k[substrate]\n- Forms **carbocation** intermediate\n- **Racemization** occurs\n- Favored by tertiary substrates\n\n## SN2 (Bimolecular)\n- Rate = k[substrate][nucleophile]\n- Backside attack → **inversion**\n- Favored by primary substrates\n\n> *SN2 needs room to attack. SN1 needs stability to wait.*` },
      { id:202, title:"Spectroscopy Basics",    by:"Priya M.", when:"2d ago",  content:`# Spectroscopy\n\n## IR Spectroscopy\n- Identifies **functional groups**\n- O-H stretch: 3200–3550 cm⁻¹\n- C=O stretch: ~1715 cm⁻¹\n\n## NMR Spectroscopy\n- Reveals **carbon skeleton**\n- Chemical shift (δ) in ppm\n- **TMS** = reference at 0 ppm\n\n## Key Rule\n> *IR tells you what groups. NMR tells you the structure.*` },
    ],
    resources: [
      { id:201, name:"Reaction Mechanism Guide",ext:"PDF",      size:"3.4 MB", upvotes:44, by:"Priya M.", ago:"5d", voted:false },
      { id:202, name:"Spectroscopy Tables",     ext:"PDF",      size:"1.1 MB", upvotes:38, by:"Chen W.",  ago:"1w", voted:false },
    ],
  },
  {
    id:3, emoji:"📐", name:"Linear Algebra", course:"MATH301", color:"#a78bfa",
    members:12, tags:["Matrices","Eigenvectors"], next:"Thu 7PM", live:true, meetLinks:[],
    desc:"Proof-heavy Axler course. We share visualizations and build intuition for vector spaces together.",
    notes: [
      { id:301, title:"Eigenvalues & Vectors",  by:"Jordan L.",when:"1d ago",  content:`# Eigenvalues & Eigenvectors\n\n## Definition\nFor matrix **A**, scalar λ is an eigenvalue if:\n\`Av = λv\` for nonzero vector **v**\n\n## Finding Eigenvalues\nSolve: \`det(A − λI) = 0\`\n\n## Key Properties\n- **trace(A)** = sum of eigenvalues\n- **det(A)** = product of eigenvalues\n\n## Applications\n- **PCA** in data science\n- **Google PageRank**\n- **Quantum mechanics** energy levels` },
      { id:302, title:"Matrix Transformations", by:"Jordan L.",when:"3d ago",  content:`# Matrix Transformations\n\n## Types\n- **Rotation** — preserves length\n- **Scaling** — stretches/shrinks\n- **Shear** — slants the shape\n- **Projection** — reduces dimension\n\n## Composition\nApply right to left: \`(AB)x = A(Bx)\`\n\n## Inverse\n\`A⁻¹\` exists iff \`det(A) ≠ 0\`\n\nUse **row reduction** to find it.` },
    ],
    resources: [
      { id:301, name:"Eigenvalue Tutorial",     ext:"PDF",      size:"820 KB", upvotes:52, by:"Jordan L.",ago:"1w", voted:false },
      { id:302, name:"3Blue1Brown Notes",        ext:"MD",       size:"180 KB", upvotes:71, by:"Jordan L.",ago:"3d", voted:false },
    ],
  },
  {
    id:4, emoji:"🤖", name:"Machine Learning", course:"CS401", color:"#fbbf24",
    members:7, tags:["PyTorch","Neural Nets"], next:"Sat 3PM", live:false, meetLinks:[],
    desc:"From gradient descent to transformers. Paper reading sessions and projects with PyTorch and HuggingFace.",
    notes: [
      { id:401, title:"Gradient Descent",       by:"Sam T.",   when:"6h ago",  content:`# Gradient Descent\n\n## Core Idea\nMinimize loss by stepping in the direction of **negative gradient**.\n\n\`θ = θ − α ∇L(θ)\`\n\n## Variants\n- **Batch GD** — uses all data, slow\n- **SGD** — one sample, noisy but fast\n- **Mini-batch** — best of both worlds\n\n## Learning Rate α\n- Too high → overshoots\n- Too low → slow convergence\n- Use **learning rate schedulers**` },
      { id:402, title:"Transformer Architecture",by:"Sam T.",  when:"2d ago",  content:`# Transformers\n\n## Key Components\n- **Self-Attention** — relates tokens to each other\n- **Multi-Head Attention** — multiple attention in parallel\n- **Positional Encoding** — injects position info\n- **Feed-Forward** — per-position MLP\n\n## Attention Formula\n\`Attention(Q,K,V) = softmax(QKᵀ/√d)V\`\n\n## Why it works\nCaptures **long-range dependencies** better than RNNs.` },
    ],
    resources: [
      { id:401, name:"PyTorch Quickstart",       ext:"NOTEBOOK", size:"5.1 MB", upvotes:89, by:"Sam T.",   ago:"3d", voted:false },
      { id:402, name:"Gradient Descent Notebook",ext:"NOTEBOOK", size:"3.2 MB", upvotes:80, by:"Sam T.",   ago:"3d", voted:false },
      { id:403, name:"Attention Is All You Need",ext:"PDF",      size:"2.8 MB", upvotes:95, by:"Sam T.",   ago:"1w", voted:false },
    ],
  },
  {
    id:5, emoji:"🎨", name:"History of Art", course:"ART201", color:"#f472b6",
    members:4, tags:["Renaissance","Modern"], next:"Wed 5PM", live:false, meetLinks:[],
    desc:"Western and non-Western art movements. We annotate slides and collaboratively write critical essays.",
    notes: [
      { id:501, title:"Renaissance Overview",   by:"Maria G.", when:"1d ago",  content:`# Renaissance Art\n\n## Period\n14th – 17th century, starting in **Florence, Italy**\n\n## Key Characteristics\n- **Humanism** — focus on the individual\n- **Linear perspective** — depth on flat surface\n- **Chiaroscuro** — light and shadow contrast\n\n## Masters\n- **Leonardo da Vinci** — Mona Lisa, Last Supper\n- **Michelangelo** — Sistine Chapel, David\n- **Raphael** — School of Athens` },
    ],
    resources: [
      { id:501, name:"Renaissance Timeline",    ext:"DOC",      size:"450 KB", upvotes:28, by:"Maria G.", ago:"1w", voted:false },
    ],
  },
  {
    id:6, emoji:"🔥", name:"Thermodynamics", course:"PHY401", color:"#4ade80",
    members:9, tags:["Entropy","Heat","Laws"], next:"Mon 8PM", live:false, meetLinks:[],
    desc:"Classical and statistical thermo. PSet sessions every Monday. Solutions wiki is our crown jewel.",
    notes: [
      { id:601, title:"Laws of Thermodynamics", by:"Chen W.",  when:"2d ago",  content:`# Laws of Thermodynamics\n\n## Zeroth Law\nIf A=B and B=C in temperature, then **A=C**. Defines thermal equilibrium.\n\n## First Law\n\`ΔU = Q − W\`\nEnergy is **conserved**. Heat added minus work done equals change in internal energy.\n\n## Second Law\nEntropy of an **isolated system** always increases.\n\`ΔS ≥ 0\`\n\n## Third Law\nAs T → 0 K, entropy → 0 (perfect crystal).` },
    ],
    resources: [
      { id:601, name:"Entropy & Enthalpy Notes",ext:"MD",       size:"120 KB", upvotes:41, by:"Chen W.",  ago:"4d", voted:false },
    ],
  },
  {
    id:7, emoji:"📊", name:"Microeconomics", course:"ECON201", color:"#60a5fa",
    members:6, tags:["Markets","Game Theory"], next:"Tue 5PM", live:true, meetLinks:[],
    desc:"Game theory, market structures, behavioral economics. We debate case studies and prep for quant econ careers.",
    notes: [
      { id:701, title:"Game Theory Basics",     by:"Aisha R.", when:"3d ago",  content:`# Game Theory\n\n## Nash Equilibrium\nA state where **no player benefits** from changing strategy unilaterally.\n\n## Prisoner's Dilemma\nTwo players both defect even though **cooperation** yields better results.\n\n## Dominant Strategy\nBest response **regardless** of what the other player does.\n\n## Applications\n- **Auctions** — bidding strategies\n- **Oligopolies** — pricing decisions\n- **International trade** — tariff wars` },
    ],
    resources: [
      { id:701, name:"Game Theory Problems",    ext:"PDF",      size:"2.3 MB", upvotes:33, by:"Aisha R.", ago:"6d", voted:false },
    ],
  },
  {
    id:8, emoji:"⚛️", name:"Quantum Physics", course:"PHY501", color:"#f472b6",
    members:11, tags:["Wave Functions","QED"], next:"Sun 2PM", live:true, meetLinks:[],
    desc:"Schrödinger equation and perturbation theory. Requires strong linear algebra background.",
    notes: [
      { id:801, title:"Schrödinger Equation",   by:"Leo M.",   when:"4h ago",  content:`# Schrödinger Equation\n\n## Time-Dependent Form\n\`iℏ ∂Ψ/∂t = ĤΨ\`\n\n## Time-Independent Form\n\`ĤΨ = EΨ\`\nUsed for **stationary states** (energy eigenstates).\n\n## Wave Function Ψ\n- |Ψ|² = **probability density**\n- Must be normalized: \`∫|Ψ|²dx = 1\`\n\n## Particle in a Box\nSimplest model — energy levels are **quantized**:\n\`Eₙ = n²π²ℏ²/(2mL²)\`` },
    ],
    resources: [
      { id:801, name:"Schrödinger Walkthrough",  ext:"PDF",     size:"1.8 MB", upvotes:71, by:"Leo M.",   ago:"2d", voted:false },
      { id:802, name:"Quantum Mechanics Basics", ext:"VIDEO",   size:"45 MB",  upvotes:84, by:"Leo M.",   ago:"5d", voted:false },
    ],
  },
];

export const GROUP_COLORS = ["#38bdf8","#2dd4bf","#a78bfa","#fbbf24","#f472b6","#4ade80","#60a5fa"];
export const GROUP_EMOJIS = ["⚡","🧪","📐","🤖","🎨","🔥","🌊","🧠","📡","🔬","⚛️","📊"];
