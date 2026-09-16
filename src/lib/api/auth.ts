import { apiClient } from "@/lib/api/client";

/* =========================================================
   TYPES
========================================================= */

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

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

  /*
   * Kept for compatibility with the existing
   * subscriber registration/success flow.
   */
  subscriber_application?: {
    application_id?: string;
  };
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
   * Compatibility field.
   *
   * Member & Contributor currently share the same
   * publishing-access flow in this project.
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
      formData.append(
        key,
        value ? "true" : "false",
      );
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

     Supports:

     authApi.login({
       email,
       password
     })

     and:

     authApi.login(
       email,
       password
     )
  ------------------------------------------------------- */

  async login(
    payloadOrEmail:
      | { email: string; password: string }
      | string,
    password?: string,
  ): Promise<LoginResponse> {
    const email =
      typeof payloadOrEmail === "string"
        ? payloadOrEmail
        : payloadOrEmail.email;

    const normalizedEmail = String(
      email ?? "",
    ).trim();

    const normalizedPassword =
      typeof payloadOrEmail === "string"
        ? String(password ?? "")
        : String(
            payloadOrEmail.password ?? "",
          );

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    if (!normalizedPassword) {
      throw new Error("Password is required.");
    }

    const { data } =
      await apiClient.post<LoginResponse>(
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
  ------------------------------------------------------- */

  async registerMemberApplication(
    payload:
      | FormData
      | Record<string, unknown>,
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
            "Content-Type":
              "multipart/form-data",
          },
        },
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN:
     LIST MEMBER & CONTRIBUTOR APPLICATIONS
  ------------------------------------------------------- */

  async getMemberContributorApplications(): Promise<
    MemberContributorApplication[]
  > {
    const { data } =
      await apiClient.get<
        MemberContributorApplication[]
      >(
        "/auth/member-contributor-applications/",
      );

    return data;
  },

  /* -------------------------------------------------------
     ADMIN:
     APPROVE MEMBER & CONTRIBUTOR

     There is no separate publishing-access system
     for Member vs Contributor in the current project.
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
     ADMIN:
     REJECT MEMBER & CONTRIBUTOR
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
     ADMIN:
     VIEW PRIVATE APPLICATION DOCUMENT
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
      await apiClient.get<User>(
        "/auth/me/",
      );

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

     Supports:

     authApi.changePassword({
       current_password,
       new_password
     })

     and:

     authApi.changePassword(
       currentPassword,
       newPassword
     )
  ------------------------------------------------------- */

  async changePassword(
    payloadOrCurrentPassword:
      | ChangePasswordPayload
      | string,
    newPassword?: string,
  ): Promise<{ message: string }> {
    const payload: ChangePasswordPayload =
      typeof payloadOrCurrentPassword ===
      "string"
        ? {
            current_password:
              payloadOrCurrentPassword,
            new_password:
              newPassword ?? "",
          }
        : payloadOrCurrentPassword;

    const { data } =
      await apiClient.post<{
        message?: string;
      }>(
        "/auth/change-password/",
        payload,
      );

    return {
      message:
        data?.message ??
        "Password changed successfully.",
    };
  },

  /* -------------------------------------------------------
     FORGOT PASSWORD

     Supports:

     authApi.forgotPassword({
       email
     })

     and:

     authApi.forgotPassword(email)
  ------------------------------------------------------- */

  async forgotPassword(
    payloadOrEmail:
      | ForgotPasswordPayload
      | string,
  ): Promise<{ message: string }> {
    const payload: ForgotPasswordPayload =
      typeof payloadOrEmail ===
      "string"
        ? {
            email: payloadOrEmail,
          }
        : payloadOrEmail;

    const { data } =
      await apiClient.post<{
        message?: string;
      }>(
        "/auth/forgot-password/",
        payload,
      );

    return {
      message:
        data?.message ??
        "If an account exists for this email, a password reset link has been sent.",
    };
  },

  /* -------------------------------------------------------
     RESET PASSWORD

     Supports:

     authApi.resetPassword({
       uid,
       token,
       new_password
     })

     and:

     authApi.resetPassword(
       uid,
       token,
       newPassword
     )
  ------------------------------------------------------- */

  async resetPassword(
    payloadOrUid:
      | ResetPasswordPayload
      | string,
    token?: string,
    newPassword?: string,
  ): Promise<{ message: string }> {
    const payload: ResetPasswordPayload =
      typeof payloadOrUid ===
      "string"
        ? {
            uid: payloadOrUid,
            token: token ?? "",
            new_password:
              newPassword ?? "",
          }
        : payloadOrUid;

    const { data } =
      await apiClient.post<{
        message?: string;
      }>(
        "/auth/reset-password/",
        payload,
      );

    return {
      message:
        data?.message ??
        "Password reset successfully.",
    };
  },

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  async logout(): Promise<{
    message?: string;
  }> {
    const { data } =
      await apiClient.post<{
        message?: string;
      }>(
        "/auth/logout/",
      );

    return data;
  },
};

export default authApi;