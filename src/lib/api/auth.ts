import { apiClient } from "@/lib/api/client";

/* =========================================================
   TYPES
========================================================= */

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type MemberContributorDocumentType =
  | "selfie"
  | "identity-proof"
  | "aadhaar"
  | "pan"
  | "supporting";

export interface User {
  id: number;
  email: string;
  username: string;
  role?: {
    id: number;
    name: string;
    label: string;
    description?: string;
  } | null;
  status?: "active" | "suspended" | "pending";
  slug?: string | null;
  profile?: {
    full_name?: string;
    phone_number?: string;
    whatsapp_number?: string;
    avatar_url?: string;
    bio?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  } | null;
}

export interface LoginResponse {
  access: string;
  user?: User;
}

export interface RegisterResponse {
  message?: string;
  user?: User;
  access?: string;
  application?: MemberContributorApplication;
}

export interface RegisterReaderPayload {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  phone_number?: string;
}

export interface RegisterAuthorPayload {
  email: string;
  username: string;
  password: string;
  bio?: string;
}

export interface RegisterSubscriberPayload {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  channels_confirmed?: string[];
  declaration_confirmed: boolean;
}

export interface MemberContributorDocumentResponse {
  url: string;
  document_type: string;
  application_id: string;
}

export interface MemberContributorApplication {
  id: number;
  application_id: string;

  full_name: string;
  date_of_birth: string;
  gender: string;
  mobile_number: string;
  email: string;

  aadhaar_number?: string | null;
  pan_number?: string | null;

  house_or_street: string;
  village_town_city: string;
  taluk: string;
  mandal: string;
  district: string;
  state: string;
  pin_code: string;

  residential_status: string;
  citizenship: string;
  educational_status: string;
  profession: string;
  below_poverty_line: boolean;

  preferred_reporting_areas: string[];

  membership_category: string;
  other_membership_category?: string;

  selfie_photo?: string | null;
  aadhaar_card?: string | null;
  pan_card?: string | null;
  identity_proof?: string | null;
  supporting_documents?: string | null;

  declaration_accepted: boolean;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  communication_consent: boolean;

  status: ApplicationStatus;

  /*
   * Kept for compatibility with the existing database/API.
   * New Member & Contributor approvals should not use this
   * as a separate access-role selector.
   */
  approved_role?: "member" | "contributor" | null;

  approved_by?: number | null;
  approved_at?: string | null;

  rejection_reason?: string;
  rejected_by?: number | null;
  rejected_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface MemberContributorApprovalResponse {
  message: string;
  application: MemberContributorApplication;
}

export interface MemberContributorRejectResponse {
  message: string;
  application: MemberContributorApplication;
}

export interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  avatar_url?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface AuthApiErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function toFormData(
  payload: Record<string, unknown>,
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, String(item));
      });
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

/* =========================================================
   AUTH API
========================================================= */

export const authApi = {
  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  async login(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    const normalizedEmail = String(email ?? "").trim();
    const normalizedPassword = String(password ?? "");

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    if (!normalizedPassword) {
      throw new Error("Password is required.");
    }

    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login/",
      {
        email: normalizedEmail,
        password: normalizedPassword,
      },
    );

    return data;
  },

  /* -------------------------------------------------------
     READER REGISTRATION
  ------------------------------------------------------- */

  async registerReader(
    payload: RegisterReaderPayload,
  ): Promise<RegisterResponse> {
    const { data } =
      await apiClient.post<RegisterResponse>(
        "/auth/register/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     AUTHOR REGISTRATION
  ------------------------------------------------------- */

  async registerAuthor(
    payload: RegisterAuthorPayload,
  ): Promise<RegisterResponse> {
    const { data } =
      await apiClient.post<RegisterResponse>(
        "/auth/register-author/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     SUBSCRIBER REGISTRATION
  ------------------------------------------------------- */

  async registerSubscriber(
    payload: RegisterSubscriberPayload,
  ): Promise<RegisterResponse> {
    const { data } =
      await apiClient.post<RegisterResponse>(
        "/auth/register-subscriber/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     MEMBER & CONTRIBUTOR REGISTRATION

     Uses multipart/form-data because documents/files
     are uploaded to the backend/R2.
  ------------------------------------------------------- */

  async registerMemberApplication(
    payload: FormData | Record<string, unknown>,
  ): Promise<RegisterResponse> {
    const body =
      payload instanceof FormData
        ? payload
        : toFormData(payload);

    const { data } =
      await apiClient.post<RegisterResponse>(
        "/auth/register-member-contributor/",
        body,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN: LIST MEMBER & CONTRIBUTOR APPLICATIONS
  ------------------------------------------------------- */

  async getMemberContributorApplications(): Promise<
    MemberContributorApplication[]
  > {
    const { data } =
      await apiClient.get<MemberContributorApplication[]>(
        "/auth/member-contributor-applications/",
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN: APPROVE MEMBER & CONTRIBUTOR

     IMPORTANT:
     There is NO separate member/contributor access role.
     Both use the same publishing access flow.
  ------------------------------------------------------- */

  async approveMemberContributorApplication(
    applicationId: number,
  ): Promise<MemberContributorApprovalResponse> {
    const { data } =
      await apiClient.post<MemberContributorApprovalResponse>(
        `/auth/member-contributor-applications/${applicationId}/approve/`,
        {},
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN: REJECT MEMBER & CONTRIBUTOR
  ------------------------------------------------------- */

  async rejectMemberContributorApplication(
    applicationId: number,
    reason: string,
  ): Promise<MemberContributorRejectResponse> {
    const { data } =
      await apiClient.post<MemberContributorRejectResponse>(
        `/auth/member-contributor-applications/${applicationId}/reject/`,
        {
          reason,
        },
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN: VIEW PRIVATE APPLICATION DOCUMENT
  ------------------------------------------------------- */

  async getMemberContributorDocument(
    applicationId: number,
    documentType: MemberContributorDocumentType,
  ): Promise<MemberContributorDocumentResponse> {
    const { data } =
      await apiClient.get<MemberContributorDocumentResponse>(
        `/auth/member-contributor-applications/${applicationId}/document/${documentType}/`,
      );

    return data;
  },

  /* -------------------------------------------------------
     CURRENT USER
  ------------------------------------------------------- */

  async me(): Promise<User> {
    const { data } =
      await apiClient.get<User>("/auth/me/");

    return data;
  },

  /* -------------------------------------------------------
     UPDATE CURRENT USER PROFILE
  ------------------------------------------------------- */

  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<User> {
    const { data } =
      await apiClient.patch<User>(
        "/auth/me/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     CHANGE PASSWORD
  ------------------------------------------------------- */

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ message?: string }> {
    const { data } =
      await apiClient.post<{ message?: string }>(
        "/auth/change-password/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     FORGOT PASSWORD
  ------------------------------------------------------- */

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<{ message?: string }> {
    const { data } =
      await apiClient.post<{ message?: string }>(
        "/auth/forgot-password/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     RESET PASSWORD
  ------------------------------------------------------- */

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ message?: string }> {
    const { data } =
      await apiClient.post<{ message?: string }>(
        "/auth/reset-password/",
        payload,
      );

    return data;
  },

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  async logout(): Promise<{ message?: string }> {
    const { data } =
      await apiClient.post<{ message?: string }>(
        "/auth/logout/",
      );

    return data;
  },
};

export default authApi;
