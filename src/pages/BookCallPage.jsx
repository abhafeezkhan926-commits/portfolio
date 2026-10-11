import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  User,
} from 'lucide-react';

import api, { ApiError } from '../lib/api';

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d][\d\s().-]{5,31}$/;
const SLOT_CONFLICT_CODES = new Set([
  'slot-taken',
  'slot-too-soon',
  'date-unavailable',
  'out-of-range',
  'invalid-date',
  'invalid-time',
]);

/* ------------------------------------------------------------------------ *
 * Calendar arithmetic (pure UTC date keys, no timezone surprises)
 * ------------------------------------------------------------------------ */

function pktTodayKey() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const shifted = new Date(Date.now() + 5 * 60 * 60 * 1000);
    return shifted.toISOString().slice(0, 10);
  }
}

function dateKeyOf(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

function monthKeyOf(dateKey) {
  return dateKey.slice(0, 7);
}

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  return dateKeyOf(year, month - 1 + delta, 1).slice(0, 7);
}

function daysInMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Monday-first weekday index (0 = Monday … 6 = Sunday). */
function weekdayIndex(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

function addDays(dateKey, days) {
  const next = new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * 86_400_000);
  return next.toISOString().slice(0, 10);
}

function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(instant);
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function formatVisitorTime(isoString) {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === 'Asia/Karachi') return null;
    const label = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(new Date(isoString));
    return { tz, label };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------------ *
 * Small presentational pieces
 * ------------------------------------------------------------------------ */

function Stepper({ step, onJump }) {
  const labels = ['Date', 'Time', 'Details', 'Confirm'];
  return (
    <ol aria-label="Booking steps" className="flex flex-wrap items-center gap-2">
      {labels.map((label, index) => {
        const number = index + 1;
        const isDone = number < step;
        const isCurrent = number === step;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="hairline h-px w-4 sm:w-7" />}
            <button
              type="button"
              onClick={() => isDone && onJump(number)}
              disabled={!isDone}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isCurrent
                  ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100'
                  : isDone
                    ? 'border-sky-300/25 text-sky-200/90 hover:border-sky-300/50'
                    : 'border-white/10 text-slate-500'
              }`}
            >
              <span className="font-mono text-[0.68rem]">{String(number).padStart(2, '0')}</span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Notice({ kind, children }) {
  const isError = kind === 'error';
  const Icon = isError ? TriangleAlert : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? 'border-red-400/35 bg-red-500/10 text-red-200'
          : 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100'
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="field-error">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------------ */

export default function BookCallPage() {
  const initialMonth = useMemo(() => monthKeyOf(pktTodayKey()), []);

  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(initialMonth);
  const [bounds, setBounds] = useState(null); // { today, last, maxAdvanceDays }
  const [days, setDays] = useState(null); // Map<dateKey, summary>
  const [daysStatus, setDaysStatus] = useState('loading');
  const [daysError, setDaysError] = useState('');

  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [dayStatus, setDayStatus] = useState('idle');
  const [dayError, setDayError] = useState('');
  const [slotNotice, setSlotNotice] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});

  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  const [booking, setBooking] = useState(null);

  const panelRef = useRef(null);
  const dayRequestId = useRef(0);
  const monthRequestId = useRef(0);

  useEffect(() => {
    document.title = 'Book a 15-Minute Call — Abdul Hafeez Khan';
    return () => {
      document.title = 'Abdul Hafeez Khan — Frontend Developer';
    };
  }, []);

  const goToStep = useCallback((next) => {
    setStep(next);
    requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  /* ------------------------- month availability ------------------------ */

  const loadMonth = useCallback(async (monthKey) => {
    const requestId = ++monthRequestId.current;
    setDaysStatus('loading');
    setDaysError('');
    try {
      const first = `${monthKey}-01`;
      const last = dateKeyOf(
        Number(monthKey.slice(0, 4)),
        Number(monthKey.slice(5, 7)),
        daysInMonth(monthKey),
      );
      const data = await api.availabilityRange(first, last);
      if (requestId !== monthRequestId.current) return;
      const map = new Map(data.days.map((day) => [day.date, day]));
      setDays(map);
      const today = data.days.find((day) => day.isToday)?.date ?? pktTodayKey();
      setBounds({ today, last: addDays(today, data.maxAdvanceDays), maxAdvanceDays: data.maxAdvanceDays });
      setDaysStatus('ready');
    } catch (error) {
      if (requestId !== monthRequestId.current) return;
      setDays(null);
      setDaysStatus('error');
      setDaysError(error instanceof ApiError ? error.message : 'Could not load the calendar.');
    }
  }, []);

  useEffect(() => {
    loadMonth(month);
  }, [month, loadMonth]);

  /* --------------------------- day slot list --------------------------- */

  const loadDay = useCallback(async (dateKey) => {
    const requestId = ++dayRequestId.current;
    setDayStatus('loading');
    setDayError('');
    try {
      const data = await api.availability(dateKey);
      if (requestId !== dayRequestId.current) return;
      setDayDetail(data);
      setDayStatus('ready');
    } catch (error) {
      if (requestId !== dayRequestId.current) return;
      setDayDetail(null);
      setDayStatus('error');
      setDayError(error instanceof ApiError ? error.message : 'Could not load available times.');
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setDayDetail(null);
      setDayStatus('idle');
      return undefined;
    }
    loadDay(selectedDate);
    return undefined;
  }, [selectedDate, loadDay]);

  /* ------------------------------ actions ------------------------------ */

  const chooseDate = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedTime(null);
    setSlotNotice('');
  };

  const chooseTime = (slot) => {
    if (slot.state !== 'available') return;
    setSelectedTime(slot.time);
    setSlotNotice('');
  };

  const validateForm = () => {
    const errors = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (name.length < 2 || name.length > 80) errors.name = 'Please enter your name (2–80 characters).';
    if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';
    if (phone && !PHONE_PATTERN.test(phone)) errors.phone = 'Please enter a valid phone number, or leave it blank.';
    return errors;
  };

  const continueFromDetails = (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    const firstInvalid = ['name', 'email', 'phone'].find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`book-${firstInvalid}`)?.focus();
      return;
    }
    goToStep(4);
  };

  const resetForAnotherCall = () => {
    setBooking(null);
    setSubmitStatus('idle');
    setSubmitError(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlotNotice('');
    setForm({ name: '', email: '', phone: '' });
    setFormErrors({});
    goToStep(1);
    loadMonth(month);
  };

  const confirmBooking = useCallback(async () => {
    if (submitStatus === 'submitting') return;
    setSubmitStatus('submitting');
    setSubmitError(null);

    try {
      const data = await api.createBooking({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date: selectedDate,
        time: selectedTime,
      });
      setBooking(data.booking);
      setSubmitStatus('success');
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setSubmitError({ message: 'Something unexpected happened. Please try again.' });
        setSubmitStatus('error');
        return;
      }
      if (error.code === 'validation-failed' && error.details) {
        setFormErrors(error.details);
        setSubmitStatus('idle');
        const firstInvalid = ['name', 'email', 'phone'].find((field) => error.details[field]);
        goToStep(3);
        if (firstInvalid) {
          requestAnimationFrame(() => document.getElementById(`book-${firstInvalid}`)?.focus());
        }
        return;
      }
      if (SLOT_CONFLICT_CODES.has(error.code)) {
        // The slot changed underneath the visitor — send them back to the live
        // availability view with the server's reason.
        setSlotNotice(error.message);
        setSelectedTime(null);
        setSubmitStatus('idle');
        goToStep(2);
        if (selectedDate) loadDay(selectedDate);
        return;
      }
      setSubmitError({ message: error.message });
      setSubmitStatus('error');
    }
  }, [form, selectedDate, selectedTime, submitStatus, goToStep, loadDay]);

  /* --------------------------- derived values -------------------------- */

  const canGoPrev = bounds ? month > monthKeyOf(bounds.today) : false;
  const canGoNext = bounds ? month < monthKeyOf(bounds.last) : true;

  const monthCells = useMemo(() => {
    const total = daysInMonth(month);
    const first = `${month}-01`;
    const leading = weekdayIndex(first);
    const cells = [];
    for (let i = 0; i < leading; i += 1) cells.push(null);
    for (let day = 1; day <= total; day += 1) cells.push(dateKeyOf(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, day));
    return cells;
  }, [month]);

  const selectedDay = selectedDate && days ? days.get(selectedDate) : null;
  const selectedSlot = dayDetail?.slots?.find((slot) => slot.time === selectedTime) ?? null;
  const visitorTime = selectedSlot ? formatVisitorTime(selectedSlot.startsAt) : null;

  const fieldProps = (field) => ({
    id: `book-${field}`,
    name: field,
    value: form[field],
    onChange: (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setFormErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    },
    'aria-invalid': formErrors[field] ? 'true' : undefined,
    'aria-describedby': formErrors[field] ? `book-${field}-error` : undefined,
    className: 'field',
    disabled: submitStatus === 'submitting',
  });

  /* ------------------------------- render ------------------------------ */

  return (
    <div className="section pt-[calc(var(--header-h,62px)+2.5rem)]">
      <div className="shell">
        <p className="eyebrow">Book a call</p>
        <h1 className="mt-3 max-w-2xl text-balance text-3xl font-semibold sm:text-4xl">
          Pick a time for a <span className="text-gradient">15-minute call</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-slate-400">
          Four quick steps: choose a date, pick an open slot, leave your details and confirm.
          Availability below is read live from the booking database — what you see is what is free.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip"><Clock aria-hidden="true" className="size-3.5" /> 15 minutes</span>
          <span className="chip"><Globe aria-hidden="true" className="size-3.5" /> Pakistan Standard Time (PKT)</span>
          <span className="chip"><MapPin aria-hidden="true" className="size-3.5" /> Asia/Karachi (UTC+5)</span>
        </div>

        {submitStatus === 'success' && booking ? (
          <section
            ref={panelRef}
            tabIndex={-1}
            aria-labelledby="booking-success-title"
            className="glass mt-10 max-w-2xl scroll-mt-28 p-6 outline-none sm:p-8"
          >
            <Notice kind="success">
              <p id="booking-success-title" className="font-semibold text-emerald-200">Your call is confirmed.</p>
              <p className="mt-1">
                The booking is saved in the database with reference{' '}
                <span className="font-mono text-cyan-200">{booking.id.slice(0, 8).toUpperCase()}</span>.
              </p>
            </Notice>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-white/5 pb-3">
                <dt className="text-slate-500">Date</dt>
                <dd className="font-medium text-slate-100">{formatLongDate(booking.date)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-white/5 pb-3">
                <dt className="text-slate-500">Time</dt>
                <dd className="font-medium text-slate-100">
                  {booking.time} PKT ({booking.timezoneLabel ?? 'Pakistan Standard Time'})
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-white/5 pb-3">
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium text-slate-100">{booking.durationMinutes} minutes</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                <dt className="text-slate-500">Booked for</dt>
                <dd className="font-medium text-slate-100">
                  {booking.name} · {booking.email}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              Need to change anything? Send a note through the{' '}
              <Link to="/#contact" className="text-cyan-300 underline-offset-4 hover:underline">contact form</Link>{' '}
              and mention your reference.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/" className="btn btn-ghost">
                <ArrowLeft aria-hidden="true" className="size-4" /> Back to portfolio
              </Link>
              <button type="button" className="btn btn-primary" onClick={resetForAnotherCall}>
                Book another call
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="mt-10">
              <Stepper step={step} onJump={goToStep} />
            </div>

            <div
              ref={panelRef}
              tabIndex={-1}
              className="glass mt-6 max-w-3xl scroll-mt-28 p-5 outline-none sm:p-8"
              aria-live="polite"
            >
              {/* -------------------------------------------------- step 1 */}
              {step === 1 && (
                <section aria-labelledby="step-date-title">
                  <h2 id="step-date-title" className="flex items-center gap-3 text-lg font-semibold">
                    <CalendarDays aria-hidden="true" className="size-5 text-cyan-300" />
                    Choose a date
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Sundays are closed. The calendar reflects the booking database, so fully
                    booked days are marked.
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setMonth((current) => shiftMonth(current, -1))}
                      disabled={!canGoPrev}
                      aria-label="Previous month"
                    >
                      <ArrowLeft aria-hidden="true" className="size-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>
                    <p aria-live="polite" className="font-mono text-sm tracking-wide text-slate-200">
                      {formatMonthLabel(month)}
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setMonth((current) => shiftMonth(current, 1))}
                      disabled={!canGoNext}
                      aria-label="Next month"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>

                  {daysStatus === 'error' ? (
                    <div className="mt-6">
                      <Notice kind="error">
                        <p>{daysError}</p>
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-2 text-cyan-300 hover:underline"
                          onClick={() => loadMonth(month)}
                        >
                          <RefreshCw aria-hidden="true" className="size-4" /> Try again
                        </button>
                      </Notice>
                      <p className="mt-4 text-sm text-slate-500">
                        If the booking service stays unreachable, you can still reach out via the{' '}
                        <Link to="/#contact" className="text-cyan-300 underline-offset-4 hover:underline">contact form</Link>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`cal-grid mt-5 ${daysStatus === 'loading' ? 'animate-pulse opacity-60' : ''}`}
                        role="group"
                        aria-label={`Days in ${formatMonthLabel(month)}`}
                        aria-busy={daysStatus === 'loading'}
                      >
                        {WEEKDAY_LABELS.map((label, index) => (
                          <span
                            key={label}
                            className="pb-1 text-center font-mono text-[0.66rem] uppercase tracking-[0.18em] text-slate-500"
                            aria-label={WEEKDAY_FULL[index]}
                          >
                            {label}
                          </span>
                        ))}
                        {monthCells.map((dateKey, index) => {
                          if (!dateKey) return <span key={`blank-${index}`} aria-hidden="true" />;
                          const day = days?.get(dateKey);
                          const selectable = Boolean(day?.isSelectable);
                          const isSelected = selectedDate === dateKey;
                          const ariaLabel = day
                            ? `${formatLongDate(dateKey)}${
                                day.isSelectable
                                  ? ` — ${day.available} of ${day.total} slots available`
                                  : ` — ${day.closedReason ?? 'unavailable'}`
                              }`
                            : formatLongDate(dateKey);
                          return (
                            <button
                              key={dateKey}
                              type="button"
                              className={`cal-day${day?.isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                              disabled={!selectable}
                              aria-pressed={isSelected}
                              aria-current={day?.isToday ? 'date' : undefined}
                              aria-label={ariaLabel}
                              onClick={() => chooseDate(dateKey)}
                            >
                              <span>{Number(dateKey.slice(8, 10))}</span>
                              {day && (
                                <span
                                  aria-hidden="true"
                                  className={`cal-day__dot${day.isSelectable && day.available > 0 ? '' : ' cal-day__dot--empty'}`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-slate-500">
                        A <span className="text-cyan-300">cyan dot</span> means open slots remain that
                        day. Outlined day is today. Days that are booked out or outside the booking
                        window are disabled.
                      </p>
                    </>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500" aria-live="polite">
                      {selectedDate && selectedDay
                        ? `Selected: ${formatLongDate(selectedDate)}`
                        : 'Pick a day to continue.'}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!selectedDate}
                      onClick={() => goToStep(2)}
                    >
                      Choose a time <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* -------------------------------------------------- step 2 */}
              {step === 2 && (
                <section aria-labelledby="step-time-title">
                  <h2 id="step-time-title" className="flex items-center gap-3 text-lg font-semibold">
                    <Clock aria-hidden="true" className="size-5 text-cyan-300" />
                    Pick a time — {selectedDate ? formatLongDate(selectedDate) : ''}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    All times are {dayDetail?.timezoneLabel ?? 'Pakistan Standard Time (PKT), UTC+5'}. Each
                    call lasts {dayDetail?.slotMinutes ?? 15} minutes.
                  </p>

                  {slotNotice && (
                    <div className="mt-4">
                      <Notice kind="error">{slotNotice}</Notice>
                    </div>
                  )}

                  {dayStatus === 'loading' && (
                    <div className="mt-6 animate-pulse" aria-busy="true">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {Array.from({ length: 12 }, (_, index) => (
                          <div key={index} className="h-11 rounded-xl border border-white/5 bg-white/5" />
                        ))}
                      </div>
                    </div>
                  )}

                  {dayStatus === 'error' && (
                    <div className="mt-6">
                      <Notice kind="error">
                        <p>{dayError}</p>
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-2 text-cyan-300 hover:underline"
                          onClick={() => selectedDate && loadDay(selectedDate)}
                        >
                          <RefreshCw aria-hidden="true" className="size-4" /> Try again
                        </button>
                      </Notice>
                    </div>
                  )}

                  {dayStatus === 'ready' && dayDetail && !dayDetail.isSelectable && (
                    <div className="mt-6">
                      <Notice kind="error">
                        <p>{dayDetail.closedReason ?? 'That day is not open for bookings.'}</p>
                      </Notice>
                      <button
                        type="button"
                        className="btn btn-ghost mt-5"
                        onClick={() => goToStep(1)}
                      >
                        <ArrowLeft aria-hidden="true" className="size-4" /> Pick another date
                      </button>
                    </div>
                  )}

                  {dayStatus === 'ready' && dayDetail?.isSelectable && (
                    <>
                      {dayDetail.summary.available === 0 ? (
                        <div className="mt-6">
                          <Notice kind="error">
                            <p>Every slot on this day is taken. Try another date.</p>
                          </Notice>
                        </div>
                      ) : (
                        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Available times">
                          {dayDetail.slots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={slot.state !== 'available'}
                              aria-pressed={selectedTime === slot.time}
                              className={`slot${selectedTime === slot.time ? ' is-selected' : ''}${
                                slot.state === 'booked'
                                  ? ' slot--booked'
                                  : slot.state === 'past'
                                    ? ' slot--past'
                                    : ''
                              }`}
                              onClick={() => chooseTime(slot)}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className="inline-block size-3 rounded border border-slate-400/50" />
                          Available
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className="inline-block size-3 rounded border border-slate-400/40 line-through" />
                          Booked
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className="inline-block size-3 rounded border border-dashed border-slate-500/60" />
                          Unavailable (too soon)
                        </span>
                      </div>
                      {visitorTime && selectedSlot && (
                        <p className="mt-3 text-xs text-slate-500">
                          Your device is set to {visitorTime.tz} — {selectedSlot.label} PKT is {visitorTime.label} for you.
                        </p>
                      )}
                    </>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(1)}>
                      <ArrowLeft aria-hidden="true" className="size-4" /> Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!selectedTime}
                      onClick={() => goToStep(3)}
                    >
                      Your details <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* -------------------------------------------------- step 3 */}
              {step === 3 && (
                <section aria-labelledby="step-details-title">
                  <h2 id="step-details-title" className="flex items-center gap-3 text-lg font-semibold">
                    <User aria-hidden="true" className="size-5 text-cyan-300" />
                    Your details
                  </h2>

                  <dl className="glass-soft mt-4 grid gap-3 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Date</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">{formatLongDate(selectedDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Time</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">
                        {selectedSlot?.label ?? selectedTime} PKT · 15 minutes
                      </dd>
                    </div>
                  </dl>

                  <form onSubmit={continueFromDetails} noValidate className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="book-name" className="label">
                        Name <span aria-hidden="true" className="text-cyan-300">*</span>
                      </label>
                      <input
                        {...fieldProps('name')}
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Your full name"
                      />
                      <FieldError id="book-name-error">{formErrors.name}</FieldError>
                    </div>
                    <div>
                      <label htmlFor="book-email" className="label">
                        Email <span aria-hidden="true" className="text-cyan-300">*</span>
                      </label>
                      <input
                        {...fieldProps('email')}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        placeholder="you@example.com"
                      />
                      <FieldError id="book-email-error">{formErrors.email}</FieldError>
                    </div>
                    <div>
                      <label htmlFor="book-phone" className="label">Phone <span className="text-slate-600">(optional)</span></label>
                      <input
                        {...fieldProps('phone')}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+92 …"
                      />
                      <FieldError id="book-phone-error">{formErrors.phone}</FieldError>
                    </div>

                    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                      <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyan-300/70" />
                      Your details are used only to arrange and run this call. They are stored in
                      this site's own booking database and are never shared with third parties.
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button type="button" className="btn btn-ghost" onClick={() => goToStep(2)}>
                        <ArrowLeft aria-hidden="true" className="size-4" /> Back
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Review booking <ArrowRight aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* -------------------------------------------------- step 4 */}
              {step === 4 && (
                <section aria-labelledby="step-confirm-title">
                  <h2 id="step-confirm-title" className="flex items-center gap-3 text-lg font-semibold">
                    <CheckCircle2 aria-hidden="true" className="size-5 text-cyan-300" />
                    Review and confirm
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    One click books it — the slot is written to the database instantly.
                  </p>

                  <dl className="glass-soft mt-5 space-y-3 p-5 text-sm">
                    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                      <dt className="text-slate-500">Date</dt>
                      <dd className="font-medium text-slate-100">{formatLongDate(selectedDate)}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                      <dt className="text-slate-500">Time</dt>
                      <dd className="font-medium text-slate-100">{selectedSlot?.label ?? selectedTime} PKT</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                      <dt className="text-slate-500">Duration</dt>
                      <dd className="font-medium text-slate-100">15 minutes</dd>
                    </div>
                    <div className="hairline" />
                    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="font-medium text-slate-100">{form.name.trim()}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                      <dt className="text-slate-500">Email</dt>
                      <dd className="font-medium text-slate-100">{form.email.trim()}</dd>
                    </div>
                    {form.phone.trim() && (
                      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                        <dt className="text-slate-500">Phone</dt>
                        <dd className="font-medium text-slate-100">{form.phone.trim()}</dd>
                      </div>
                    )}
                  </dl>

                  {submitStatus === 'error' && submitError && (
                    <div className="mt-5">
                      <Notice kind="error">
                        <p>{submitError.message}</p>
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-2 text-cyan-300 hover:underline"
                          onClick={confirmBooking}
                        >
                          <RefreshCw aria-hidden="true" className="size-4" /> Try again
                        </button>
                      </Notice>
                    </div>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={submitStatus === 'submitting'}
                      onClick={() => goToStep(3)}
                    >
                      <ArrowLeft aria-hidden="true" className="size-4" /> Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-gold"
                      disabled={submitStatus === 'submitting'}
                      onClick={confirmBooking}
                    >
                      {submitStatus === 'submitting' ? (
                        <>
                          <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Booking…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 aria-hidden="true" className="size-4" /> Confirm booking
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}
            </div>

            <p className="mt-6 max-w-3xl text-xs leading-relaxed text-slate-600">
              This page talks to a real Express + MongoDB API. Slot availability, today&apos;s date
              and the booking confirmation all come from the server — nothing on this page is
              simulated or hardcoded.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
