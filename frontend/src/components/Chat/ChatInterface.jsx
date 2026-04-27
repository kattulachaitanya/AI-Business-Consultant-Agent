import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import BusinessDashboard from "../BusinessIntel/BusinessDashboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./ChatInterface.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { auth } from "../../firebase.config";
import { signOut } from "firebase/auth";

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const systemPrompt = `You are an advanced AI assistant specializing in both business consulting and IT project management. Your capabilities include:

Business Consulting:
- Strategic planning and business model analysis
- Market research and competitive analysis
- Financial modeling and forecasting
- Process optimization and organizational design
- Risk assessment and mitigation strategies

IT Project Management:
- Technical architecture design
- Project planning and estimation
- Agile/Scrum methodology implementation
- Technology stack selection
- Code review and best practices
- System integration planning

You provide clear, actionable advice based on industry best practices and real-world experience.`;

const initialMessage = {
  role: "assistant",
  content:
    "👋 Hello! I'm your AI Business and Technology Advisor. I can help you with: Business Strategy, Market Analysis, Technical Architecture, Project Management. How can I assist you today?",
};

const apiUrl = import.meta.env.VITE_API_URL;

const createFallbackStructuredData = (replyText = "") => {
  const text = replyText.toLowerCase();

  let marketPotential = 75;
  let riskLevel = 50;
  let competitionIntensity = 60;
  let executionDifficulty = 55;
  let recommendationScore = 78;
  let growthOpportunity = 80;

  if (text.includes("high competition")) competitionIntensity = 82;
  if (text.includes("high risk")) riskLevel = 78;
  if (text.includes("strong opportunity")) growthOpportunity = 88;
  if (text.includes("recommended") || text.includes("good opportunity")) {
    recommendationScore = 85;
  }
  if (text.includes("difficult") || text.includes("challenging")) {
    executionDifficulty = 72;
  }

  return {
    metrics: {
      marketPotential,
      riskLevel,
      competitionIntensity,
      executionDifficulty,
      recommendationScore,
      growthOpportunity,
    },
    swot: {
      strengths: [
        "Growing market demand",
        "Potential for strong niche positioning",
      ],
      weaknesses: [
        "Requires trust-building and strong execution",
        "May need upfront effort for early traction",
      ],
      opportunities: [
        "Expanding digital adoption in target market",
        "Ability to differentiate with specialization",
      ],
      threats: [
        "Established competitors may react quickly",
        "Customer acquisition costs may rise",
      ],
    },
    risks: [
      {
        name: "Market Adoption Risk",
        likelihood: "Medium",
        impact: "High",
        description: "Customer acquisition may be slower than expected",
      },
      {
        name: "Competitive Pressure",
        likelihood: "High",
        impact: "Medium",
        description: "Established players may respond aggressively",
      },
      {
        name: "Execution Risk",
        likelihood: "Medium",
        impact: "Medium",
        description: "Operational complexity may slow scaling",
      },
    ],
  };
};

const ChatInterface = () => {
  const theme = useTheme();
  const [conversations, setConversations] = useState([
    { id: 1, title: "Start a new chat", messages: [initialMessage] },
  ]);
  const [currentConversation, setCurrentConversation] = useState(1);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

useEffect(() => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/login");
  }
}, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation]);

  const createNewChat = () => {
    const newId =
      conversations.length > 0
        ? Math.max(...conversations.map((c) => c.id)) + 1
        : 1;

    const newChat = {
      id: newId,
      title: "New Chat",
      messages: [initialMessage],
    };

    setConversations([...conversations, newChat]);
    setCurrentConversation(newId);
  };

  const getCurrentMessages = () => {
    return (
      conversations.find((c) => c.id === currentConversation)?.messages || []
    );
  };

  const updateCurrentConversation = (messages) => {
    setConversations((convs) =>
      convs.map((conv) =>
        conv.id === currentConversation
          ? {
              ...conv,
              messages,
              title: messages[1]?.content?.slice(0, 30) + "..." || "New Chat",
            }
          : conv
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const currentMessages = getCurrentMessages();
    const updatedMessages = [...currentMessages, userMessage];

    updateCurrentConversation(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          messages: updatedMessages,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage += `: ${JSON.stringify(errorData)}`;
        } catch {
          errorMessage += `: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply || "No response generated.",
        research: data.research || [],
        structured:
          data.structured || createFallbackStructuredData(data.reply || ""),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      updateCurrentConversation(finalMessages);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        role: "assistant",
        content:
          `⚠️ Error: ${error.message}\n\n` +
          `Please try again. If this continues, check:\n` +
          `- Backend is running on ${apiUrl}\n` +
          `- Internet connection is active\n` +
          `- OpenRouter API key is valid\n` +
          `- SerpAPI key is valid`,
      };

      const failedMessages = [...updatedMessages, errorMessage];
      updateCurrentConversation(failedMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={createNewChat}>
          <ChatIcon /> Your Chats
        </button>

        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={
                "conversation-item" +
                (conv.id === currentConversation ? " active" : "")
              }
              onClick={() => setCurrentConversation(conv.id)}
            >
              <ChatIcon />
              {conv.title}
            </div>
          ))}
        </div>

        <div className="user-section">
          <button className="account-btn" onClick={() => navigate("/blogs")}>
            <UserIcon /> Blogs
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-container">
          <div className="chat-messages">
            {getCurrentMessages().map((message, index) => (
              <div
                key={index}
                className={"message " + message.role}
                style={{
                  background:
                    message.role === "assistant"
                      ? theme.palette.background.paper
                      : theme.palette.primary.main,
                }}
              >
                <div className="message-content">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>

                  {message.role === "assistant" && message.structured && (
                    <BusinessDashboard
                      structured={message.structured}
                      messageId={index}
                    />
                  )}

                  {message.research && message.research.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <strong>Research Sources:</strong>
                      <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                        {message.research.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "6px" }}>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#90caf9" }}
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant">
                <div className="loading-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about business or technology..."
              className="chat-input"
              style={{
                borderColor: theme.palette.primary.light,
                color: theme.palette.text.primary,
              }}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
              style={{
                background: theme.palette.primary.main,
              }}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;