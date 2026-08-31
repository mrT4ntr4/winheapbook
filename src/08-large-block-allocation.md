# Large Block Allocation

<p class="reading-meta">{{ #word_count }} words · {{ #reading_time }}</p>

Large block allocation handles requests above the normal backend segment allocation limit. Compared to the other allocators it is much simpler: it almost directly allocates a large block of memory from the system and stores it in a red-black tree. Release removes it from the tree and returns it to the system directly.

## Size

The large block path is used for requests above the segment context maximum allocation size:

```text
Size > 0x7f0000
```

## Structures

Relevant structures:

- `_HEAP_LARGE_ALLOC_DATA`

### Large Alloc Data

`_HEAP_LARGE_ALLOC_DATA` is the metadata node for one large allocation, stored in `SegmentHeap->LargeAllocMetadata` and keyed by `VirtualAddress`.

```text
_HEAP_LARGE_ALLOC_DATA
0x0    TreeNode (0x18 bytes)   _RTL_BALANCED_NODE
0x18   VirtualAddress (8 bytes)
0x20:12 AllocatedPages (52 bits)
```

| Field | Meaning |
| --- | --- |
| `TreeNode` | `_RTL_BALANCED_NODE`: `Left` points to a node whose `VirtualAddress` is smaller, `Right` to a node whose `VirtualAddress` is greater, and `ParentValue` points to the parent node. |
| `VirtualAddress` | Address of the large block. |
| `AllocatedPages` | The number of allocated pages. The lowest 16 bits are used to record unused bytes. |

## Allocation Mechanism

The allocation is page-based. The main implementation function is `nt!RtlpHpMetadataAlloc`:

1. Allocate memory to store the large block metadata (`_HEAP_LARGE_ALLOC_DATA`) using `RtlpHpMetadataHeapCtxGet` and `RtlpHpMetadataHeapStart`. These determine which heap to allocate from based on `SegmentHeap->EnvHandle`, selecting `ExPoolState->HeapManager.MetadataHeaps[idx]`.
2. Use `RtlpHpAllocVA` to allocate the memory, and store the `VirtualAddress` in the metadata.
3. Insert the metadata into `SegmentHeap->LargeAllocMetadata`.

## Free Mechanism

The main implementation function is `RtlpHpLargeFree`:

1. Find the node corresponding to the free pointer in `SegmentHeap->LargeAllocMetadata`, and remove the node.
2. Use `RtlpHpFreeVA` to release the memory.
3. Release the memory storing the metadata (`RtlpHpMetadataFree`).

For exploitation or corruption analysis, keep this path separate from VS and backend segment allocation. The metadata layout and lookup behavior are different.