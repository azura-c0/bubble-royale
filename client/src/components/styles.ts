export const inputStyle = `
  padding: 12px 16px;
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  background-color: rgba(40, 40, 43, 0.9);
  font-family: 'ProggyClean', monospace;
  border: 2px solid #444;
  border-radius: 8px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1);
  outline: none;
  transition: all 0.2s ease-out;
  caret-color: #b1a9e4;
  width: 100%;
  min-width: 200px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  
  /* Placeholder styling */
  ::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }
  
  /* Focus state */
  :focus {
    border-color: #b1a9e4;
    box-shadow: 
      inset 0 2px 5px rgba(0, 0, 0, 0.3),
      0 0 8px rgba(177, 169, 228, 0.6);
    background-color: rgba(45, 45, 50, 0.95);
  }
  
  /* Selection styling */
  ::selection {
    background-color: rgba(177, 169, 228, 0.3);
    color: #ffffff;
  }
  
  /* Disable browser default styling on autofill */
  :-webkit-autofill,
  :-webkit-autofill:hover,
  :-webkit-autofill:focus {
    -webkit-text-fill-color: #ffffff;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: #b1a9e4;
  }
  
  /* Disabled state */
  :disabled {
    opacity: 0.6;
    background-color: rgba(30, 30, 33, 0.9);
    border-color: #333;
    cursor: not-allowed;
  }
`;
