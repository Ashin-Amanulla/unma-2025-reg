import { useNavigate } from "react-router-dom";

/**
 * ScrollLink component that handles navigation to sections on the same or different pages
 * @param {Object} props - Component props
 * @param {string} props.to - Path including hash (e.g., "/#faq")
 * @param {React.ReactNode} props.children - Child elements to render
 * @param {string} [props.className] - Optional CSS class names
 * @returns {JSX.Element} - Rendered component
 */
const ScrollLink = ({ to, children, className = "", ...rest }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    // Parse path and hash
    let path = to;
    let hash = "";

    if (to.includes("#")) {
      [path, hash] = to.split("#");
      hash = hash ? hash : "";
    }

    // Handle relative paths
    if (path === "") path = "/";

    const currentPath = window.location.pathname;

    if (path === currentPath) {
      // Same page - just scroll to element
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      // Different page - navigate and then scroll after page loads
      navigate(path);

      // After navigation, scroll to the hash element
      if (hash) {
        // Use setTimeout to ensure the DOM has loaded
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};

export default ScrollLink;
