/**
 * ACE代码编辑器组件
 */
import React from 'react';
import AceEditor from 'react-ace';

// 导入ACE编辑器的主题和语言模式
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface ACEditorProps {
  mode?: string;
  theme?: string;
  value?: string;
  onChange?: (value: string) => void;
  width?: string | number;
  height?: string | number;
  className?: string;
  readOnly?: boolean;
  fontSize?: number;
  showPrintMargin?: boolean;
  showGutter?: boolean;
  highlightActiveLine?: boolean;
  tabSize?: number;
  enableBasicAutocompletion?: boolean;
  enableLiveAutocompletion?: boolean;
  enableSnippets?: boolean;
  wrapEnabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

const ACEditor: React.FC<ACEditorProps> = ({
  mode = 'sh',
  theme = 'monokai',
  value = '',
  onChange,
  width = '100%',
  height = '200px',
  className,
  readOnly = false,
  fontSize = 14,
  showPrintMargin = true,
  showGutter = true,
  highlightActiveLine = true,
  tabSize = 2,
  enableBasicAutocompletion = true,
  enableLiveAutocompletion = true,
  enableSnippets = true,
  wrapEnabled = false,
  placeholder,
  style,
  ...props
}) => {
  return (
    <div style={style}>
      <AceEditor
        mode={mode}
        theme={theme}
        value={value}
        onChange={onChange}
        width={`${width}`}
        height={`${height}`}
        className={className}
        readOnly={readOnly}
        fontSize={fontSize}
        showPrintMargin={showPrintMargin}
        showGutter={showGutter}
        highlightActiveLine={highlightActiveLine}
        tabSize={tabSize}
        placeholder={placeholder}
        setOptions={{
          enableBasicAutocompletion,
          enableLiveAutocompletion,
          enableSnippets,
          showLineNumbers: true,
          tabSize,
          wrap: wrapEnabled,
        }}
        {...props}
      />
    </div>
  );
};

export default ACEditor;
