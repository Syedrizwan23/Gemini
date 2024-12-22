import { createContext, useState } from "react";
import PropTypes from "prop-types";
import run from "../config/gemini";

// Create the context
export const Context = createContext();

const ContextProvider = ({ children }) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    // Helper function to delay paragraph updates
    const delayPara = (index, nextword) => {
        setTimeout(() => {
            setResultData((prev) => `${prev}${nextword}`);
        }, 75 * index);
    };

    // Helper function to format the response
    const formatResponse = (response) => {
        let formatted = response
            .split("**")
            .map((text, i) => (i % 2 === 1 ? `<b>${text}</b>` : text))
            .join("");
        return formatted.split("*").join("<br/>");
    };

    // Function to reset chat
    const newChat = () => {
        setShowResult(false);
        setLoading(false);
        setResultData("");
    };

    // Function to handle sending a prompt
    const onSent = async (prompt) => {
        try {
            setResultData("");
            setLoading(true);
            setShowResult(true);

            let response;
            if (prompt) {
                response = await run(prompt);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts((prev) => [...prev, input]);
                response = await run(input);
            }

            const formattedResponse = formatResponse(response);
            const wordsArray = formattedResponse.split(" ");
            wordsArray.forEach((word, i) => delayPara(i, `${word} `));

        } catch (error) {
            console.error("Error fetching response:", error);
            setResultData("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    // Context value
    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

// Define PropTypes for ContextProvider
ContextProvider.propTypes = {
    children: PropTypes.node.isRequired, // Accepts any valid React node
};

export default ContextProvider;
