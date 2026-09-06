"use client";

import { useState } from "react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newTicket = {
      id: `TCK-${Date.now()}`,
      user: name,
      email: email,
      subject: subject,
      category: "Other",
      message: message,
      priority: "Medium",
      status: "Open",
      reply: "",
      createdAt: new Date().toLocaleString(),
    };

    const tickets = JSON.parse(localStorage.getItem("app_tickets") || "[]");
    tickets.push(newTicket);
    localStorage.setItem("app_tickets", JSON.stringify(tickets));

    alert("Ticket submitted successfully!");

    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Submit Support Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-900 p-3 rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-900 p-3 rounded"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-zinc-900 p-3 rounded"
        />
        <textarea
          placeholder="Describe your problem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-zinc-900 p-3 rounded"
        />
        <button 
          type="submit" 
          className="bg-red-600 px-6 py-2 rounded font-bold"
        >
          Submit Ticket
        </button>
      </form>
    </main>
  );
}