import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./ProfilePanel.css";

interface ProfileProps {
  isGuest?: boolean;
  userName?: string;
  userEmail?: string;
  progress?: number;
}

function Profile({
  isGuest = false,
  userName = "User",
  userEmail = "",
  progress = 0,
}: ProfileProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /*
   * =========================================
   * LOAD REAL SUPABASE USER
   * =========================================
   */

  useEffect(() => {
    if (isGuest) {
      setName("Guest");
      setEmail("");
      return;
    }

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        setName(fullName);
        setEmail(user.email || "");
      } catch (error) {
        console.error("CURIO profile loading error:", error);
      }
    };

    loadProfile();
  }, [isGuest]);

  /*
   * =========================================
   * KEEP PROPS UPDATED
   * =========================================
   */

  useEffect(() => {
    if (!isGuest) {
      if (userName) {
        setName(userName);
      }

      if (userEmail) {
        setEmail(userEmail);
      }
    }
  }, [userName, userEmail, isGuest]);

  /*
   * =========================================
   * CHANGE PASSWORD
   * =========================================
   */

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!newPassword) {
      setPasswordMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setPasswordMessage("Password changed successfully.");

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPassword(false);
        setPasswordMessage("");
      }, 1500);
    } catch (error) {
      console.error("CURIO password change error:", error);

      if (error instanceof Error) {
        setPasswordMessage(error.message);
      } else {
        setPasswordMessage("Unable to change password.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  /*
   * =========================================
   * SIGN OUT
   * =========================================
   */

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      /*
       * Guest logout
       */

      if (isGuest) {
        sessionStorage.removeItem("curio_guest");

        setIsOpen(false);

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /*
       * Real Supabase account logout
       */

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      sessionStorage.removeItem("curio_guest");

      setIsOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("CURIO logout error:", error);

      setIsLoggingOut(false);
    }
  };

  /*
   * =========================================
   * PROFILE TOGGLE
   * =========================================
   */

  const handleProfileClick = () => {
    setIsOpen((previous) => !previous);
  };

  /*
   * =========================================
   * CLOSE PROFILE
   * =========================================
   */

  const handleCloseProfile = () => {
    setIsOpen(false);
  };

  /*
   * =========================================
   * AVATAR
   * =========================================
   */

  const avatar = isGuest ? "👤" : "🧑🏻";

  /*
   * =========================================
   * SAFE PROGRESS
   * =========================================
   */

  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="dashboard-profile-wrapper">

      {/* =====================================
          PROFILE BUTTON
      ====================================== */}

      <button
        type="button"
        className={`dashboard-profile ${
          isOpen ? "profile-open" : ""
        }`}
        onClick={handleProfileClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open profile menu"
      >
        <div className="dashboard-avatar">
          {avatar}
        </div>

        <div className="dashboard-profile-text">
          <strong>
            Hi, {name} 👋
          </strong>

          <span>
            {isGuest ? "Guest" : "Beginner"}
          </span>
        </div>

        <span className="profile-panel-chevron">
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {/* =====================================
          PROFILE PANEL
      ====================================== */}

      {isOpen && (
        <div
          className="profile-panel"
          role="dialog"
          aria-label="Profile panel"
        >

          {/* =================================
              PROFILE HEADER
          ================================== */}

          <div className="profile-panel-header">

            <div className="profile-panel-user">

              <div className="profile-panel-avatar">
                {avatar}
              </div>

              <div className="profile-panel-user-info">

                <span className="profile-panel-user-name">
                  {name}
                </span>

                <span className="profile-panel-user-role">
                  {isGuest
                    ? "Exploring CURIO"
                    : "Beginner learner"}
                </span>

              </div>

            </div>

            <button
              type="button"
              className="profile-panel-close"
              onClick={handleCloseProfile}
              aria-label="Close profile panel"
            >
              ×
            </button>

          </div>

          {/* =================================
              ACCOUNT
          ================================== */}

          <div className="profile-panel-body">

            <div className="profile-panel-section-title">
              ACCOUNT
            </div>

            <div className="profile-panel-info">

              {/* EMAIL */}

              <div className="profile-panel-info-item">

                <div className="profile-panel-info-icon">
                  ✉️
                </div>

                <div className="profile-panel-info-content">

                  <span className="profile-panel-info-label">
                    Email
                  </span>

                  <span className="profile-panel-info-value">
                    {isGuest
                      ? "Guest account"
                      : email || "Email unavailable"}
                  </span>

                </div>

              </div>

              {/* ACCOUNT TYPE */}

              <div className="profile-panel-info-item">

                <div className="profile-panel-info-icon">
                  👤
                </div>

                <div className="profile-panel-info-content">

                  <span className="profile-panel-info-label">
                    Account
                  </span>

                  <span
                    className={`profile-panel-info-value ${
                      isGuest
                        ? "guest-account"
                        : ""
                    }`}
                  >
                    {isGuest
                      ? "Guest"
                      : "CURIO Learner"}
                  </span>

                </div>

              </div>

            </div>

            {/* =================================
                PROGRESS
            ================================== */}

            <div className="profile-panel-progress">

              <div className="profile-panel-progress-top">

                <div className="profile-panel-progress-icon">
                  📈
                </div>

                <div className="profile-panel-progress-content">

                  <span className="profile-panel-info-label">
                    Learning progress
                  </span>

                  <span className="profile-panel-progress-value">
                    {isGuest
                      ? "Not saved"
                      : `${safeProgress}%`}
                  </span>

                </div>

              </div>

              {!isGuest && (
                <div className="profile-panel-progress-track">
                  <div
                    className="profile-panel-progress-bar"
                    style={{
                      width: `${safeProgress}%`,
                    }}
                  />
                </div>
              )}

            </div>

          </div>

          {/* =================================
              GUEST INFORMATION
          ================================== */}

          {isGuest && (
            <div className="profile-panel-guest">

              <div className="profile-panel-guest-icon">
                ✨
              </div>

              <div className="profile-panel-guest-content">

                <strong>
                  You're exploring as a guest
                </strong>

                <p>
                  Your learning progress will not be
                  saved until you create an account.
                </p>

              </div>

            </div>
          )}

          {/* =================================
              SECURITY
          ================================== */}

          {!isGuest && (
            <div className="profile-panel-security">

              <div className="profile-panel-section-title">
                SECURITY
              </div>

              <button
                type="button"
                className={`profile-panel-password-button ${
                  showPassword ? "active" : ""
                }`}
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
              >

                <span className="profile-panel-password-icon">
                  🔑
                </span>

                <span className="profile-panel-password-content">

                  <strong>
                    Change password
                  </strong>

                  <small>
                    Update your account password
                  </small>

                </span>

                <span className="profile-panel-password-arrow">
                  {showPassword ? "⌃" : "→"}
                </span>

              </button>

              {/* PASSWORD FORM */}

              {showPassword && (
                <div className="profile-panel-password-form">

                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="profile-panel-update-button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword
                      ? "Updating..."
                      : "Update password"}
                  </button>

                  {passwordMessage && (
                    <span
                      className={`profile-panel-password-message ${
                        passwordMessage.includes(
                          "successfully"
                        )
                          ? "success"
                          : "error"
                      }`}
                    >
                      {passwordMessage}
                    </span>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================
              FOOTER
          ================================== */}

          <div className="profile-panel-footer">

            <button
              type="button"
              className="profile-panel-logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >

              <span className="profile-panel-action-icon">
                ↪
              </span>

              <span>
                {isLoggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </span>

            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;