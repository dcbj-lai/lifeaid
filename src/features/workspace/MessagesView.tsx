import { Send } from "lucide-react";
import type { LifeAidDemoState } from "../../hooks/useLifeAidDemo";

import { Pill } from "../../components/ui";
import CaseTable from "../../components/CaseTable";

export default function MessagesView({ state }: { state: LifeAidDemoState }) {
  const { chat, addMessage, can, canRecord } = state;
  if (!canRecord("messages.view", "DEMO-P-1001"))
    return <p>No conversations available.</p>;
  return (
    <section className="la-panel la-messages">
      <aside>
        <div className="la-eyebrow">WORK CONVERSATIONS</div>
        <div className="la-conversation active">
          <span className="la-avatar">LR</span>
          <div>
            <strong>Library team</strong>
            <small>Maya, Rina, SWP team</small>
          </div>
        </div>
        <p className="la-muted">
          Messages stay with the placement, so activity reviews and follow-ups
          have context.
        </p>
      </aside>
      <div className="la-chat">
        <div className="la-chat-head">
          <strong>Library team</strong>
          <Pill tone="green">Placement conversation</Pill>
        </div>
        <div className="la-chat-body">
          <div className="la-chat-date">DEMO CONVERSATION · SEPTEMBER 7</div>
          {chat.map((m, i) => (
            <div
              className={`la-message ${m.who.startsWith("Maya") ? "student" : ""}`}
              key={i}
            >
              <small>
                {m.who} <span>{m.time}</span>
              </small>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        {can("messages.send") && (
          <form className="la-chat-form" onSubmit={addMessage}>
            <input
              name="message"
              aria-label="Message to library team"
              placeholder="Write a message to the team…"
              required
              autoComplete="off"
            />
            <button
              className="la-button primary"
              aria-label="Send demo message"
            >
              <Send size={18} />
            </button>
          </form>
        )}
        <small className="la-chat-note">
          Local demo only. No messages are delivered outside this prototype.
        </small>
      </div>
    </section>
  );
}
