export const  formatRouteName = (name) => {
    // Remove invalid characters (except letters, numbers, and underscores)
    let formatted = name.replace(/[^a-zA-Z0-9_]/g, " ");
  
    // Convert to camelCase
    formatted = formatted
      .split(" ")
      .map((word, index) =>
        index === 0
          ? word.replace(/^\d+/, "") // Remove leading numbers
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  
    // Ensure it starts with a letter
    if (/^\d/.test(formatted)) {
      formatted = "_" + formatted;
    }
  
    return formatted;
  }
  