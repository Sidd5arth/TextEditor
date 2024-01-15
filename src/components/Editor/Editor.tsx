import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentBlock,
  DraftHandleValue,
  getDefaultKeyBinding,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./editor.css";
import Title from "../Title/Title";
import Button from "../Button/Button";

const MyEditor: React.FC = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [input, setInput] = useState<string | null>(null);
  const [currentStyle, setCurrentStyles] = useState<string[] | []>([]);
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const addedStyle = (value: string) => {
    let arr = [...currentStyle];
    if (arr.includes(value)) {
      arr = arr.filter((style) => style !== value);
    } else {
      arr.push(value);
    }

    setCurrentStyles(arr);
  };

  useEffect(() => {
    console.log(input);
    if (
      input === "# " ||
      input === "* " ||
      input === "** " ||
      input === "*** "
    ) {
      const selection = editorState.getSelection();
      const currentContent = editorState.getCurrentContent();
      const lengthToRemove = input.length;

      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: lengthToRemove,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(newEditorState);
    }
  }, [input]);

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", contentStateJSON);
  };

  const handleKeyCommand = (
    command: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const keyBindingFn = (e: React.KeyboardEvent<{}>): string | null => {
    const key = e.key;
    const isShiftPressed = e.shiftKey;

    switch (true) {
      case key === "#" && !isShiftPressed:
        return "insert-heading";
      case key === "*" && !isShiftPressed:
        return "insert-bold";
      default:
        return getDefaultKeyBinding(e);
    }
  };

  const getCurrentLineData = () => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlockKey = selection.getStartKey();
    const currentBlock = currentContent.getBlockForKey(currentBlockKey);
    setInput(currentBlock.getText());
  };

  const handleBeforeInput = (
    chars: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const selection = editorState.getSelection();
    const startOffset = selection.getStartOffset();
    const isFirstChar = startOffset === 0;

    let newEditorState = editorState;

    switch (input) {
      case "# ":
        if (isFirstChar) {
          newEditorState = RichUtils.toggleBlockType(
            newEditorState,
            "header-one"
          );
          setEditorState(newEditorState);
          addedStyle("header");
          setInput("");
          return "handled";
        }
        break;

      case "* ":
        if (isFirstChar) {
          newEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
          setEditorState(newEditorState);
          addedStyle("bold");
          setInput("");

          return "handled";
        }
        break;

      case "** ":
        if (isFirstChar) {
          newEditorState = RichUtils.toggleInlineStyle(
            editorState,
            "COLOR_RED"
          );
          setEditorState(newEditorState);
          addedStyle("color");
          setInput("");
          return "handled";
        }
        break;

      case "*** ":
        if (isFirstChar) {
          newEditorState = RichUtils.toggleInlineStyle(
            editorState,
            "UNDERLINE"
          );
          setEditorState(newEditorState);
          addedStyle("underline");
          setInput("");
          return "handled";
        }
        break;

      default:
        setEditorState(RichUtils.toggleInlineStyle(editorState, "unstyled"));
        setInput("");
        return "not-handled";
    }
    return "not-handled";
  };

  const blockStyleFn = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType();
    const inlineStyle = contentBlock.getInlineStyleAt(0);

    if (type === "unstyled") {
      return inlineStyle.has("COLOR_RED") ? "color-red-paragraph" : "paragraph";
    }
    return "";
  };

  return (
    <div className="container">
      <div className="header">
        <Title title="My Text Editor" />
        <ul className="ul-style">
          <h4>Applied Styles</h4>
          {currentStyle.map((item) => (
            <li>
              <p>{item}</p>
              <p className="p-style">
                type {}
                {item === "bold"
                  ? "* "
                  : item === "underline"
                  ? "*** "
                  : item === "header"
                  ? "# "
                  : "** "}{" "}
                space to remove
              </p>
            </li>
          ))}
        </ul>
        <Button title="Save" onClick={handleSave} />
      </div>
      <div onKeyUp={() => getCurrentLineData()} className="editorContainer">
        <Editor
          placeholder="Enter your text here"
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          keyBindingFn={keyBindingFn}
          handleBeforeInput={handleBeforeInput}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default MyEditor;
