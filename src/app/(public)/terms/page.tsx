
import type { ReactNode } from "react";
import {
  Camera,
  FileText,
  Newspaper,
  QrCode,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | War of Justice",
  description:
    "Terms and conditions for using War of Justice and applying to join as a Reporter, Cameraman or Writer.",
};

// Official payment QR code in the public folder.
const PAYMENT_QR_IMAGE = "/barcode.jpeg";

type Section = {
  number: string;
  title: string;
  content: ReactNode;
  className?: string;
};

function TermSection({
  number,
  title,
  content,
  className = "",
}: Section) {
  return (
    <section
      aria-labelledby={`terms-${number}`}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-label={`Section ${Number(number)}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-inset ring-blue-100"
        >
          {number}
        </span>

        <h2
          id={`terms-${number}`}
          className="pt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg"
        >
          {title}
        </h2>
      </div>

      <div className="mt-4 text-sm leading-7 text-slate-600 sm:pl-12">
        {content}
      </div>
    </section>
  );
}

const terms: Section[] = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing or using this website, you agree to comply
        with these Terms &amp; Conditions and our applicable
        policies. If you do not agree, please do not use our
        website or services.
      </p>
    ),
  },
  {
    number: "02",
    title: "User Responsibilities",
    content: (
      <p>
        Users must provide accurate information, follow
        applicable laws and respect the rights of other users.
        Any submitted content must comply with our content
        guidelines.
      </p>
    ),
  },
  {
    number: "03",
    title: "Intellectual Property Rights",
    content: (
      <p>
        All original content, including text, images, graphics,
        logos and designs, is protected by applicable
        intellectual property laws. Unauthorised reproduction
        or distribution is prohibited.
      </p>
    ),
  },
  {
    number: "04",
    title: "Content Licensing and Copyright",
    content: (
      <p>
        Content published on our platform may be subject to
        copyright and licensing restrictions. Commercial use,
        reproduction or redistribution requires appropriate
        authorisation.
      </p>
    ),
  },
  {
    number: "05",
    title: "User-Submitted Content",
    content: (
      <p>
        Reporters, cameramen and writers may submit articles,
        photographs, videos and other content. Contributors
        must ensure that their submissions do not infringe
        third-party rights. The organisation may review
        submissions before publication.
      </p>
    ),
  },
  {
    number: "06",
    title: "Privacy and Data Protection",
    content: (
      <p>
        We collect and process personal information in
        accordance with our Privacy Policy and applicable
        data protection laws. We take reasonable measures
        to protect user information.
      </p>
    ),
  },
  {
    number: "07",
    title: "Third-Party Links",
    content: (
      <p>
        Our website may contain links to third-party websites.
        We are not responsible for the content, policies or
        practices of external websites.
      </p>
    ),
  },
  {
    number: "08",
    title: "Disclaimer and Limitation of Liability",
    content: (
      <p>
        Website content is provided for general informational
        purposes. We do not guarantee that all content is
        error-free or uninterrupted. Liability is subject
        to applicable law.
      </p>
    ),
  },
  {
    number: "09",
    title: "Account Suspension and Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate accounts
        or memberships in accordance with these terms and
        applicable law, including in cases of serious policy
        violations.
      </p>
    ),
  },
  {
    number: "10",
    title: "Changes to Terms",
    content: (
      <p>
        We may revise these Terms &amp; Conditions when
        necessary. Updated terms will be published on this
        page with the applicable effective date.
      </p>
    ),
  },
  {
    number: "11",
    title: "Governing Law and Jurisdiction",
    content: (
      <p>
        These Terms &amp; Conditions are governed by the laws
        of India. Subject to applicable law, disputes will
        fall under the jurisdiction of the competent courts
        in Chennai, Tamil Nadu.
      </p>
    ),
  },
  {
    number: "12",
    title: "Contact Information",
    content: (
      <p>
        For questions or concerns regarding these terms,
        users may contact us through the official email
        address and contact details provided on our website.
      </p>
    ),
  },
  {
    number: "13",
    title: "Registration and Joining Fee",
    className:
      "md:col-span-2 md:w-full md:max-w-5xl md:justify-self-center",
    content: (
      <div className="space-y-4">
        <p>
          Individuals wishing to join our organisation in any
          of the following roles are required to pay a joining
          fee of{" "}
          <strong className="font-bold text-slate-900">
            ₹10,000 (Rupees Ten Thousand only)
          </strong>.
        </p>

        {/* Aligned role and fee columns */}
       <div className="mx-auto w-full rounded-xl bg-slate-50 p-4 sm:p-5 md:w-1/2">
          <div className="space-y-3">
            {["Reporter", "Cameraman", "Writer"].map((role) => (
              <div
                key={role}
                className="grid grid-cols-[1fr_120px] items-center gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium text-slate-700">
                  {role}
                </span>

                <strong className="text-right text-sm font-bold tabular-nums text-slate-900">
                  ₹10,000
                </strong>
              </div>
            ))}
          </div>
        </div>

        <p>
          The joining fee is applicable separately to each
          role. Applicants must complete the payment through
          the authorised payment methods provided on the
          website.
        </p>

        <p>
          Payment does not automatically guarantee
          employment, assignments, a fixed salary, income
          or a specific number of projects. Membership is
          subject to payment verification and approval.
        </p>

        <p>
          The applicable refund, cancellation and withdrawal
          policy must be clearly disclosed to applicants
          before payment. Do not describe the fee as
          non-refundable unless that policy has been
          established and is legally permissible.
        </p>
      </div>
    ),
  },
];

const roles = [
  {
    title: "Reporter",
    description:
      "Join as a Reporter and contribute news stories and reports.",
    icon: (
      <Newspaper aria-hidden="true" className="h-5 w-5" />
    ),
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Newspapers and news reporting material",
  },
  {
    title: "Cameraman",
    description:
      "Join as a Cameraman and contribute news footage and video content.",
    icon: (
      <Camera aria-hidden="true" className="h-5 w-5" />
    ),
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Professional camera equipment",
  },
  {
    title: "Writer",
    description:
      "Join as a Writer and contribute articles and editorial content.",
    icon: (
      <FileText aria-hidden="true" className="h-5 w-5" />
    ),
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Writing and editorial work at a desk",
  },
];

const bankDetails = [
  {
    label: "Account Name",
    value: "MARWANN CHARITABLE TRUST",
  },
  {
    label: "Bank Name",
    value: "STATE BANK OF INDIA",
  },
  {
    label: "Account Type",
    value: "Current Account",
  },
  {
    label: "Account Number",
    value: "40081291597",
  },
  {
    label: "IFSC Code",
    value: "SBIN0016539",
  },
  {
    label: "SWIFT Code",
    value: "SBININBB473",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Page heading and introduction */}
      <header className="relative isolate overflow-hidden border-b border-blue-100 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_60%)]"
        />

        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            War of Justice
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Terms &amp; Conditions
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Please read these Terms &amp; Conditions carefully
            before joining War of Justice or using this website.
            By accessing our services or applying for membership,
            you acknowledge that you have read and agree to the
            applicable terms.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* All legal sections appear before fees and payment */}
        <section aria-label="Terms and conditions">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Please read carefully
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Website and Membership Terms
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              13 sections
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {terms.map((section) => (
              <TermSection
                key={section.number}
                number={section.number}
                title={section.title}
                content={section.content}
                className={section.className}
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="my-12 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent sm:my-16"
        />

        {/* Joining fee cards */}
        <section
          aria-labelledby="joining-fees-heading"
          className="scroll-mt-8"
        >
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Membership
            </p>

            <h2
              id="joining-fees-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl"
            >
              Joining Fee
            </h2>

            <p className="mx-auto mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Select the role you are applying for. The joining
              fee is applicable separately to each role.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <article
                key={role.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={role.image}
                    alt={role.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-blue-700">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      {role.icon}
                    </span>

                    <h3 className="text-lg font-bold text-slate-950">
                      {role.title}
                    </h3>
                  </div>

                  <p className="min-h-12 text-sm leading-6 text-slate-600">
                    {role.description}
                  </p>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Joining fee
                    </p>

                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-blue-700">
                      ₹10,000
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Rupees Ten Thousand only
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Payment QR and bank transfer details */}
        <section
          aria-labelledby="payment-heading"
          className="mt-12 scroll-mt-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:mt-16 sm:p-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <QrCode aria-hidden="true" className="h-6 w-6" />
            </div>

            <h2
              id="payment-heading"
              className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl"
            >
              Scan Now and Pay
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Before making a payment, verify the role you are
              applying for and the applicable joining fee shown
              above. Use only the authorised payment details
              listed below.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* QR code */}
            <div className="flex flex-col items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-5 text-center sm:p-7">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PAYMENT_QR_IMAGE}
                  alt="War of Justice payment QR code"
                  className="h-56 w-56 object-contain sm:h-64 sm:w-64"
                />
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                Please verify the role and joining fee before
                proceeding with payment.
              </p>
            </div>

            {/* Bank details */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Building2 aria-hidden="true" className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bank Transfer Details
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Marwann Charitable Trust
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-slate-100 px-5">
                {bankDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[130px_1fr] sm:gap-3"
                  >
                    <dt className="text-xs font-medium text-slate-500 sm:text-sm">
                      {detail.label}
                    </dt>

                    <dd className="break-all text-sm font-semibold text-slate-900">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-blue-100 bg-blue-50/60 px-5 py-4">
                <p className="text-xs leading-6 text-slate-600">
                  Please ensure the beneficiary name is{" "}
                  <strong className="text-slate-900">
                    MARWANN CHARITABLE TRUST
                  </strong>{" "}
                  before transferring funds. Retain your
                  transaction reference or payment receipt
                  for your records.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-xs leading-6 text-slate-500">
              Supported UPI apps, payment receipt submission
              options and official contact details should be
              added here only when they have been verified
              and made available by the organisation.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}