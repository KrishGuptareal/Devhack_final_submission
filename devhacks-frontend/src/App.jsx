import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Topbar from "./Topbar.jsx";
import Dashboard from "./Dashboard.jsx";
import SecondPage from "./SecondPage.jsx";
import Login from "./Login.jsx";
import UserPage from "./UserPage.jsx";
import FocusMode from "./FocusMode.jsx";
import FreeMode from "./FreeMode.jsx";
import CalendarPage from "./CalendarPage.jsx";
import SubjectsPage from "./SubjectsPage.jsx";
import FlashcardsPage from "./FlashcardsPage.jsx";
import NotificationsPage from "./NotificationsPage.jsx";
import GPAStrategizer from "./GPAStrategizer.jsx";
import ElectivePlanner from "./ElectivePlanner.jsx";
import ResumeGenerator from "./ResumeGenerator.jsx";
import DSAPractice from "./DSAPractice.jsx";

function App() {
  const location = useLocation();
  const hideTopbarPaths = ["/user", "/", "/login"];
  const shouldShowTopbar = !hideTopbarPaths.includes(location.pathname);

  return (
    <div style={{
      backgroundColor: "#030712",
      minHeight: "100vh",
      backgroundImage: "radial-gradient(ellipse at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)"
    }}>
      <SignedIn>
        {shouldShowTopbar && (
          <div style={{ padding: "16px 16px 0 16px" }}>
            <Topbar />
          </div>
        )}
      </SignedIn>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/second-page"
          element={
            <>
              <SignedIn>
                <SecondPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/user"
          element={
            <>
              <SignedIn>
                <UserPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/focus/:id"
          element={
            <>
              <SignedIn>
                <FocusMode />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/free/:id"
          element={
            <>
              <SignedIn>
                <FreeMode />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/calendar"
          element={
            <>
              <SignedIn>
                <CalendarPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/subjects"
          element={
            <>
              <SignedIn>
                <SubjectsPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/flashcards"
          element={
            <>
              <SignedIn>
                <FlashcardsPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/notifications"
          element={
            <>
              <SignedIn>
                <NotificationsPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/strategy"
          element={
            <>
              <SignedIn>
                <GPAStrategizer />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/electives"
          element={
            <>
              <SignedIn>
                <ElectivePlanner />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/resume"
          element={
            <>
              <SignedIn>
                <ResumeGenerator />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/dsa"
          element={
            <>
              <SignedIn>
                <DSAPractice />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
