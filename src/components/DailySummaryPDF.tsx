import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  // Cover
  coverSection: {
    backgroundColor: "#1a1a2e",
    marginHorizontal: -50,
    marginTop: -50,
    paddingHorizontal: 50,
    paddingTop: 80,
    paddingBottom: 50,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#c0c0d0",
    marginBottom: 4,
  },
  coverCohort: {
    fontSize: 11,
    color: "#8888a0",
    marginTop: 12,
  },
  // Sections
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginTop: 28,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
    color: "#333333",
  },
  // Session blocks
  sessionBlock: {
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#1a1a2e",
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 8,
  },
  // Posts
  postBlock: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#cccccc",
  },
  postTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#444444",
  },
  postMeta: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 2,
  },
  postBody: {
    fontSize: 9,
    color: "#555555",
    lineHeight: 1.4,
  },
  // Themes list
  themeItem: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 4,
    paddingLeft: 10,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
  },
});

interface PostData {
  title: string;
  body: string;
  category: string;
  author: string;
  role: string;
}

interface SessionHighlight {
  session_title: string;
  key_points: string[];
}

interface SessionData {
  title: string;
  faculty: string | null;
  start_time: string;
  end_time: string;
  posts: PostData[];
  themes: string[];
}

interface DailySummaryPDFProps {
  dayNumber: number;
  dayName: string;
  date: string;
  executiveNarrative: string;
  crossCuttingThemes: string[];
  openQuestions: string[];
  sessionHighlights: SessionHighlight[];
  sessions: SessionData[];
  generatedAt: string;
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function DailySummaryPDF({
  dayNumber,
  dayName,
  date,
  executiveNarrative,
  crossCuttingThemes,
  openQuestions,
  sessionHighlights,
  sessions,
  generatedAt,
}: DailySummaryPDFProps) {
  const narrativeParagraphs = executiveNarrative
    .split("\n")
    .filter((p) => p.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover */}
        <View style={styles.coverSection}>
          <Text style={styles.coverTitle}>
            Cambridge AI Leadership Programme
          </Text>
          <Text style={styles.coverSubtitle}>
            Day {dayNumber} Summary — {dayName} {date}
          </Text>
          <Text style={styles.coverCohort}>Cohort 2 — Module 1</Text>
        </View>

        {/* Executive Narrative */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        {narrativeParagraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        {/* Session Highlights */}
        {sessionHighlights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Session Highlights</Text>
            {sessionHighlights.map((sh, i) => (
              <View key={i} style={styles.sessionBlock}>
                <Text style={styles.sessionTitle}>{sh.session_title}</Text>
                {sh.key_points.map((point, j) => (
                  <Text key={j} style={styles.themeItem}>
                    • {point}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Sessions with Posts */}
        <Text style={styles.sectionTitle}>Session Detail</Text>
        {sessions.map((session, i) => (
          <View key={i} style={styles.sessionBlock}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionMeta}>
              {session.faculty ? `${session.faculty} · ` : ""}
              {formatTime(session.start_time)}–{formatTime(session.end_time)}
            </Text>
            {session.themes.length > 0 && (
              <View style={{ marginBottom: 6 }}>
                <Text
                  style={{ fontSize: 9, fontWeight: "bold", color: "#555555", marginBottom: 2 }}
                >
                  Key Themes:
                </Text>
                {session.themes.map((t, j) => (
                  <Text key={j} style={styles.themeItem}>
                    • {t}
                  </Text>
                ))}
              </View>
            )}
            {session.posts.slice(0, 3).map((post, j) => (
              <View key={j} style={styles.postBlock}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postMeta}>
                  {post.author} ({post.role}) · {post.category}
                </Text>
                <Text style={styles.postBody}>
                  {post.body.length > 200
                    ? post.body.slice(0, 200) + "..."
                    : post.body}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Cross-cutting Themes */}
        {crossCuttingThemes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cross-Cutting Themes</Text>
            {crossCuttingThemes.map((theme, i) => (
              <Text key={i} style={styles.themeItem}>
                • {theme}
              </Text>
            ))}
          </>
        )}

        {/* Open Questions */}
        {openQuestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Open Questions</Text>
            {openQuestions.map((q, i) => (
              <Text key={i} style={styles.themeItem}>
                • {q}
              </Text>
            ))}
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Cambridge AI Leadership Programme — Generated {generatedAt}
        </Text>
      </Page>
    </Document>
  );
}
