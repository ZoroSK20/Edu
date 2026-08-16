import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium text-ink mb-2">Contact</h1>
      <p className="text-sm text-ink-soft mb-10 max-w-md">
        Questions about enrollment, courses or your account — reach out and
        we&rsquo;ll get back to you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="font-medium text-ink mb-4 text-sm">Send a message</h2>
          <form className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              className="w-full border border-border rounded-control px-3 py-2 text-sm bg-bone focus:outline-none focus:ring-2 focus:ring-maroon/30"
            />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full border border-border rounded-control px-3 py-2 text-sm bg-bone focus:outline-none focus:ring-2 focus:ring-maroon/30"
            />
            <textarea
              placeholder="How can we help?"
              rows={4}
              className="w-full border border-border rounded-control px-3 py-2 text-sm bg-bone focus:outline-none focus:ring-2 focus:ring-maroon/30"
            />
            <button type="submit" className="btn-accent w-full">
              Send message
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-xs text-ink-faint mb-1">Support</p>
            <p className="text-sm text-ink-soft">support@veritas.edu</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-faint mb-1">Admissions</p>
            <p className="text-sm text-ink-soft">admissions@veritas.edu</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
