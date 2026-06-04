"use client";

import { marketingBlocks } from "@/lib/blocks";
import type {
  BlockId,
  ClientAccount,
  PaymentStatus,
  UserStatus
} from "@/lib/types";

type ClientEditorProps = {
  client: ClientAccount;
  onStatusChange: (status: PaymentStatus) => void;
  onUserStatusChange: (status: UserStatus) => void;
  onClientInfoSave: (updates: Pick<ClientAccount, "name" | "companyName" | "email" | "phone" | "businessWebsite">) => void;
  onToggleBlock: (blockId: BlockId) => void;
};

export function ClientEditor({
  client,
  onStatusChange,
  onUserStatusChange,
  onClientInfoSave,
  onToggleBlock
}: ClientEditorProps) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    onClientInfoSave({
      name: String(form.get("name") || ""),
      companyName: String(form.get("companyName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      businessWebsite: String(form.get("businessWebsite") || "")
    });
  }

  return (
    <div className="grid two">
      <section className="panel">
        <p className="eyebrow">Client info</p>
        <h2>Edit client</h2>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Client name</label>
            <input defaultValue={client.name} id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="companyName">Company</label>
            <input defaultValue={client.companyName} id="companyName" name="companyName" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input defaultValue={client.email} id="email" name="email" required type="email" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input defaultValue={client.phone} id="phone" name="phone" type="tel" />
          </div>
          <div className="field">
            <label htmlFor="businessWebsite">Business website</label>
            <input defaultValue={client.businessWebsite} id="businessWebsite" name="businessWebsite" type="url" />
          </div>
          <button className="button" type="submit">
            Save client info
          </button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">Access</p>
        <h2>Account access</h2>
        <div className="field">
          <label htmlFor="status">User status</label>
          <select
            id="status"
            value={client.status}
            onChange={(event) => onUserStatusChange(event.target.value as UserStatus)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="paymentStatus">Payment status</label>
          <select
            id="paymentStatus"
            value={client.paymentStatus}
            onChange={(event) => onStatusChange(event.target.value as PaymentStatus)}
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Tools</p>
        <h2>Enabled blocks</h2>
        <div className="grid">
          {marketingBlocks.map((block) => (
            <label className="check-row" key={block.id}>
              <input
                checked={client.enabledBlocks.includes(block.id)}
                onChange={() => onToggleBlock(block.id)}
                type="checkbox"
              />
              {block.name}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
