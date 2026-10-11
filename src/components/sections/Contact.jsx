import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Phone, Send } from 'lucide-react';

import { contact, profile } from '../../data/profile';
import { api, ApiError } from '../../lib/api';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SocialLinks from '../SocialLinks';

const EMPTY = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < 2) errors.name = 'That name looks a little short.';
  else if (name.length > 80) errors.name = 'Please keep the name under 80 characters.';

  const email = values.email.trim();
  if (!email) errors.email = 'Please enter your email address.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';

  const subject = values.subject.trim();
  if (subject.length > 120) errors.subject = 'Please keep the subject under 120 characters.';

  const message = values.message.trim();
  if (!message) errors.message = 'Please write a short message.';
  else if (message.length < 20) errors.message = 'Please add a little more detail (20 characters minimum).';
  else if (message.length > 4000) errors.message = 'Please keep the message under 4000 characters.';

  return errors;
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validate(values);
    setErrors(found);
    setServerError('');

    if (Object.keys(found).length > 0) {
      const firstField = Object.keys(found)[0];
      document.getElementById(`contact-${firstField}`)?.focus();
      return;
    }

    setStatus('sending');

    try {
      await api.sendMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim() || undefined,
        message: values.message.trim(),
      });
      setValues(EMPTY);
      setStatus('sent');
    } catch (error) {
      setStatus('error');
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong while sending. Please try again.',
      );
    }
  };

  const fieldProps = (field) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: update(field),
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    className: 'field',
    disabled: status === 'sending',
  });

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="shell">
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          title="Let's build something together"
          lead="Whether it is a role, a freelance project or a question about something on this site, the form below reaches me directly through this site's own API."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Reveal className="glass edge-glow relative overflow-hidden p-7 md:p-9" delay={60}>
            {status === 'sent' ? (
              <div className="flex flex-col items-start gap-4" role="status" aria-live="polite">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--color-cyan)]/35 bg-[color:var(--color-cyan)]/10">
                  <CheckCircle2 size={22} className="text-[color:var(--color-cyan)]" aria-hidden="true" />
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--color-ink)]">
                  Message received
                </h3>
                <p className="max-w-md text-[0.94rem] leading-relaxed text-[color:var(--color-muted)]">
                  Your message has been saved against this site&rsquo;s database and I read every one
                  that comes in. Expect a reply at the email address you provided.
                </p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('idle')}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="contact-name">
                      Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      {...fieldProps('name')}
                    />
                    {errors.name && (
                      <p className="field-error" id="contact-name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="contact-email">
                      Email <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...fieldProps('email')}
                    />
                    {errors.email && (
                      <p className="field-error" id="contact-email-error">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="contact-subject">
                    Subject <span className="text-[color:var(--color-faint)]">(optional)</span>
                  </label>
                  <input type="text" placeholder="What is this about?" {...fieldProps('subject')} />
                  {errors.subject && (
                    <p className="field-error" id="contact-subject-error">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="contact-message">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tell me about the role, project or question…"
                    {...fieldProps('message')}
                  />
                  {errors.message ? (
                    <p className="field-error" id="contact-message-error">
                      {errors.message}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[0.78rem] text-[color:var(--color-faint)]">
                      {values.message.length}/4000 characters
                    </p>
                  )}
                </div>

                {status === 'error' && serverError && (
                  <p
                    className="flex items-start gap-2 rounded-xl border border-red-400/35 bg-red-400/10 px-3.5 py-3 text-[0.86rem] leading-relaxed text-red-200"
                    role="alert"
                  >
                    <AlertCircle size={15} className="mt-[3px] shrink-0" aria-hidden="true" />
                    <span>
                      {serverError}{' '}
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:text-red-100"
                        onClick={onSubmit}
                      >
                        Try again
                      </button>
                    </span>
                  </p>
                )}

                <p className="text-[0.78rem] leading-relaxed text-[color:var(--color-faint)]">
                  Your name, email and message are stored only so that I can reply to you. Nothing is
                  shared with third parties.
                </p>

                <div>
                  <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} aria-hidden="true" />
                        Send message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal className="glass lift flex flex-col gap-4 p-7" delay={120}>
              <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                Find me elsewhere
              </h3>
              <SocialLinks />
              <p className="text-[0.86rem] leading-relaxed text-[color:var(--color-muted)]">
                GitHub is where the code lives, LinkedIn is the fastest way to reach me
                professionally, and Instagram is the least professional of the three.
              </p>
            </Reveal>

            {contact.email || contact.phone ? (
              <Reveal className="glass lift flex flex-col gap-3 p-7" delay={180}>
                <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                  Direct
                </h3>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2.5 text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                  >
                    <Mail size={16} aria-hidden="true" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2.5 text-[0.92rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                  >
                    <Phone size={16} aria-hidden="true" />
                    {contact.phone}
                  </a>
                )}
              </Reveal>
            ) : (
              <Reveal className="glass lift flex flex-col gap-3 p-7" delay={180}>
                <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                  Direct contact
                </h3>
                <p className="text-[0.86rem] leading-relaxed text-[color:var(--color-muted)]">
                  A direct email address has not been published on this site yet. Use the form, or
                  reach out on LinkedIn — both arrive in the same place.
                </p>
              </Reveal>
            )}

            <Reveal className="glass lift flex flex-col gap-3 p-7" delay={240}>
              <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                Before you write
              </h3>
              <p className="text-[0.86rem] leading-relaxed text-[color:var(--color-muted)]">
                {profile.availability}. I am based in {profile.timezoneLabel}, so replies may arrive
                on a different clock than yours.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
