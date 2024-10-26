import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs'; // For syntax highlighting
import 'prismjs/themes/prism.css'; // Include Prism CSS for default styling
import styles from './Editor.module.css'; // Import module CSS for additional styling

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [output, setOutput] = useState('');

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const executeCode = () => {
    try {
      // Evaluate the code and set the output
      // Note: Using eval can be dangerous, use with caution!
      // For demonstration purposes only, consider safer alternatives in production.
      const result = eval(code);
      setOutput(result !== undefined ? result.toString() : 'No output');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <h1 className={styles.editorTitle}>Code Editor</h1>
      <Editor
        value={code}
        onValueChange={handleCodeChange}
        highlight={code => highlight(code, languages.javascript)} // Highlight code
        padding={10} // Add padding
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
          border: '1px solid #ddd',
          borderRadius: '8px',
          height: '400px',
          overflow: 'auto', // Add scrolling if content exceeds height
          backgroundColor: '#2d2d2d', // Dark background for better contrast
          color: '#f8f8f2', // Light text color
        }}
      />
      <button className={styles.executeButton} onClick={executeCode}>Run Code</button>
      <h2 className={styles.outputTitle}>Output:</h2>
      <pre className={styles.output}>{output}</pre>
    </div>
  );
};

export default CodeEditor;
