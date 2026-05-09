"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db, getFirebaseClientSetupError } from "@/lib/firebase";

const initialState = {
  fullName: "",
  email: "",
  subject: "Order Enquiry",
  message: ""
};

export function ContactForm() {
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!db) {
      setStatus(getFirebaseClientSetupError());
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await addDoc(collection(db, "contactMessages"), {
        name: formState.fullName.trim(),
        email: formState.email.trim(),
        subject: formState.subject,
        message: formState.message.trim(),
        createdAt: serverTimestamp(),
        status: "unread"
      });

      setFormState(initialState);
      setStatus("Thanks for reaching out. Your message has been received.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send your message right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 shadow-[rgba(0,0,0,0.12)_0_4px_16px]">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          name="fullName"
          onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
          placeholder="Full Name"
          required
          value={formState.fullName}
        />
        <Input
          name="email"
          onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email"
          required
          type="email"
          value={formState.email}
        />
        <Select
          name="subject"
          onChange={(event) => setFormState((current) => ({ ...current, subject: event.target.value }))}
          value={formState.subject}
        >
          <option value="Order Enquiry">Order Enquiry</option>
          <option value="Product Question">Product Question</option>
          <option value="Returns">Returns</option>
          <option value="Other">Other</option>
        </Select>
        <Textarea
          name="message"
          onChange={(event) => setFormState((current) => ({ ...current, message: event.target.value }))}
          placeholder="Message"
          required
          value={formState.message}
        />

        {status ? <p className="text-caption text-bodyGray">{status}</p> : null}

        <Button disabled={loading} fullWidth type="submit">
          {loading ? "Sending" : "Send Message"}
        </Button>
      </form>
    </Card>
  );
}
