import { describe, expect, it } from "vitest";
import type { ExplorerNode } from "../types";
import {
  addChildToFolder,
  collectReferenceFiles,
  countSynthFiles,
  duplicateNode,
  findFilePathById,
  findFirstFileId,
  findNodeById,
  insertSiblingAfterId,
  isSynthFileName,
  removeNodeById,
  setAllFoldersOpen,
  updateNodeById,
} from "./index";

/*
 * The file explorer's tree operations.
 *
 * All of them recurse and all of them rebuild the tree immutably, which is an
 * easy combination to get subtly wrong -- and the specific way it goes wrong
 * here is that a student's file disappears. A rename that drops a sibling, or
 * a delete that takes a folder's other children with it, is not a cosmetic
 * bug.
 *
 * So most of these tests assert on the *whole* tree afterwards rather than on
 * the one node that was supposed to change. A test that only checks the
 * renamed node passes just as happily when everything around it was lost.
 */

function file(id: string, name = `${id}.synth`, content = ""): ExplorerNode {
  return { id, type: "file", name, content };
}

function folder(id: string, children: ExplorerNode[], name = id): ExplorerNode {
  return { id, type: "folder", name, isOpen: false, children };
}

/*
 *  root/
 *    a.synth
 *    nested/
 *      b.synth
 *      deeper/
 *        c.synth
 *  loose.synth
 */
function tree(): ExplorerNode[] {
  return [
    folder("root", [
      file("a"),
      folder("nested", [file("b"), folder("deeper", [file("c")])]),
    ]),
    file("loose"),
  ];
}

function idsOf(nodes: ExplorerNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === "folder" ? [node.id, ...idsOf(node.children)] : [node.id]
  );
}

describe("findNodeById", () => {
  it("finds a node at the top level", () => {
    expect(findNodeById(tree(), "loose")?.name).toBe("loose.synth");
  });

  it("finds a node nested several folders deep", () => {
    expect(findNodeById(tree(), "c")?.name).toBe("c.synth");
  });

  it("finds a folder as well as a file", () => {
    expect(findNodeById(tree(), "deeper")?.type).toBe("folder");
  });

  it("returns null rather than throwing when there is no such node", () => {
    expect(findNodeById(tree(), "missing")).toBeNull();
    expect(findNodeById([], "anything")).toBeNull();
  });
});

describe("findFirstFileId", () => {
  it("descends into folders to find the first file", () => {
    expect(findFirstFileId(tree())).toBe("a");
  });

  it("returns null for a tree of empty folders", () => {
    expect(findFirstFileId([folder("x", [folder("y", [])])])).toBeNull();
  });

  it("returns null for an empty tree", () => {
    expect(findFirstFileId([])).toBeNull();
  });
});

describe("updateNodeById", () => {
  it("updates the target", () => {
    const updated = updateNodeById(tree(), "c", (node) => ({ ...node, name: "renamed.synth" }));

    expect(findNodeById(updated, "c")?.name).toBe("renamed.synth");
  });

  it("keeps every other node", () => {
    const updated = updateNodeById(tree(), "c", (node) => ({ ...node, name: "renamed.synth" }));

    expect(idsOf(updated)).toEqual(idsOf(tree()));
  });

  it("does not mutate the input", () => {
    const original = tree();
    updateNodeById(original, "a", (node) => ({ ...node, name: "changed.synth" }));

    expect(findNodeById(original, "a")?.name).toBe("a.synth");
  });

  it("is a no-op when the id is not present", () => {
    expect(idsOf(updateNodeById(tree(), "missing", (n) => n))).toEqual(idsOf(tree()));
  });
});

describe("removeNodeById", () => {
  it("removes a nested file and nothing else", () => {
    const remaining = idsOf(removeNodeById(tree(), "b"));

    expect(remaining).not.toContain("b");
    expect(remaining).toEqual(idsOf(tree()).filter((id) => id !== "b"));
  });

  it("removes a folder together with its children", () => {
    const remaining = idsOf(removeNodeById(tree(), "nested"));

    expect(remaining).toEqual(["root", "a", "loose"]);
  });

  it("removes a top-level node without disturbing the rest", () => {
    expect(idsOf(removeNodeById(tree(), "loose"))).toEqual(
      idsOf(tree()).filter((id) => id !== "loose")
    );
  });

  it("leaves the tree intact when the id is not present", () => {
    expect(idsOf(removeNodeById(tree(), "missing"))).toEqual(idsOf(tree()));
  });

  it("does not mutate the input", () => {
    const original = tree();
    removeNodeById(original, "b");

    expect(idsOf(original)).toContain("b");
  });
});

describe("duplicateNode", () => {
  it("suffixes the base name and keeps the extension", () => {
    expect(duplicateNode(file("a", "main.synth")).name).toBe("main_copy.synth");
  });

  it("handles a name with several dots", () => {
    expect(duplicateNode(file("a", "notes.backup.synth")).name).toBe(
      "notes.backup_copy.synth"
    );
  });

  it("handles a name with no extension", () => {
    expect(duplicateNode(file("a", "README")).name).toBe("README_copy");
  });

  it("gives the copy a new id so it is not the same node twice", () => {
    const source = file("a", "main.synth");

    expect(duplicateNode(source).id).not.toBe(source.id);
  });

  it("copies the content", () => {
    const copy = duplicateNode(file("a", "main.synth", "print hello"));

    expect(copy.type === "file" && copy.content).toBe("print hello");
  });

  it("copies a folder's whole subtree with fresh ids throughout", () => {
    const copy = duplicateNode(folder("nested", [file("b"), folder("deeper", [file("c")])]));
    const copiedIds = idsOf([copy]);

    expect(copy.name).toBe("nested_copy");
    // nested + b + deeper + c
    expect(copiedIds).toHaveLength(4);
    // A shared id would make the two subtrees alias each other: editing the
    // copy would edit the original.
    expect(copiedIds.some((id) => ["nested", "b", "deeper", "c"].includes(id))).toBe(false);
  });
});

describe("insertSiblingAfterId", () => {
  it("inserts directly after the target at the top level", () => {
    const result = insertSiblingAfterId(tree(), "root", file("new"));

    expect(result.map((n) => n.id)).toEqual(["root", "new", "loose"]);
  });

  it("inserts directly after a nested target", () => {
    const result = insertSiblingAfterId(tree(), "b", file("new"));
    const nested = findNodeById(result, "nested");

    expect(nested?.type === "folder" && nested.children.map((n) => n.id)).toEqual([
      "b",
      "new",
      "deeper",
    ]);
  });

  it("leaves the tree unchanged when the target is absent", () => {
    expect(idsOf(insertSiblingAfterId(tree(), "missing", file("new")))).toEqual(idsOf(tree()));
  });
});

describe("addChildToFolder", () => {
  it("appends to the folder's children", () => {
    const result = addChildToFolder(tree(), "deeper", file("new"));
    const deeper = findNodeById(result, "deeper");

    expect(deeper?.type === "folder" && deeper.children.map((n) => n.id)).toEqual(["c", "new"]);
  });

  it("opens the folder so the new file is visible", () => {
    // Adding a file into a collapsed folder and leaving it collapsed looks
    // like nothing happened.
    const result = addChildToFolder(tree(), "deeper", file("new"));
    const deeper = findNodeById(result, "deeper");

    expect(deeper?.type === "folder" && deeper.isOpen).toBe(true);
  });

  it("does nothing when the target id is a file rather than a folder", () => {
    expect(idsOf(addChildToFolder(tree(), "a", file("new")))).toEqual(idsOf(tree()));
  });

  it("does nothing when the folder is absent", () => {
    expect(idsOf(addChildToFolder(tree(), "missing", file("new")))).toEqual(idsOf(tree()));
  });
});

describe("setAllFoldersOpen", () => {
  it("opens every folder at every depth", () => {
    const opened = setAllFoldersOpen(tree(), true);

    for (const id of ["root", "nested", "deeper"]) {
      const node = findNodeById(opened, id);
      expect(node?.type === "folder" && node.isOpen).toBe(true);
    }
  });

  it("closes every folder at every depth", () => {
    const closed = setAllFoldersOpen(setAllFoldersOpen(tree(), true), false);
    const root = findNodeById(closed, "root");

    expect(root?.type === "folder" && root.isOpen).toBe(false);
  });

  it("keeps every file", () => {
    expect(idsOf(setAllFoldersOpen(tree(), true))).toEqual(idsOf(tree()));
  });
});

describe("findFilePathById", () => {
  it("builds the path from the root down", () => {
    expect(findFilePathById(tree(), "c")).toBe("root/nested/deeper/c.synth");
  });

  it("returns a bare name for a top-level file", () => {
    expect(findFilePathById(tree(), "loose")).toBe("loose.synth");
  });
});

describe("collectReferenceFiles", () => {
  it("returns every file except the active one, with full paths", () => {
    const files = collectReferenceFiles(tree(), "a");

    expect(files.map((f) => f.path)).toEqual([
      "root/nested/b.synth",
      "root/nested/deeper/c.synth",
      "loose.synth",
    ]);
  });

  it("returns every file when nothing is active", () => {
    expect(collectReferenceFiles(tree(), null)).toHaveLength(4);
  });

  it("carries the content along", () => {
    const files = collectReferenceFiles([file("x", "x.synth", "print hello")], null);

    expect(files[0].content).toBe("print hello");
  });
});

describe("synth file counting", () => {
  it.each([
    ["main.synth", true],
    ["MAIN.SYNTH", true],
    ["notes.txt", false],
    ["synth", false],
    ["a.synth.txt", false],
  ])("classifies %s", (name, expected) => {
    expect(isSynthFileName(name)).toBe(expected);
  });

  it("counts synth files across the whole tree", () => {
    // The free tier caps this, so an undercount hands out a file the plan
    // does not include.
    expect(countSynthFiles(tree())).toBe(4);
  });

  it("ignores non-synth files", () => {
    expect(countSynthFiles([file("a", "a.synth"), file("b", "b.txt")])).toBe(1);
  });

  it("counts nothing in an empty tree", () => {
    expect(countSynthFiles([])).toBe(0);
  });
});
