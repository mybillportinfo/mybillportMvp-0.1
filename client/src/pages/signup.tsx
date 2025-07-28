import { useState } from "react";
// @ts-ignore
import { registerUser } from "../../../services/auth.js";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await registerUser(email, password);
      alert("Account created! Now login.");
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Register</button>
    </div>
  );
}