import java.io.*;
import java.net.*;
import java.util.*;
import java.util.regex.*;
import javax.net.ssl.*;
import java.security.cert.X509Certificate;

public class WebCrawlerService {

    private Set<String> visitedURLs = new HashSet<>();
    private StringBuilder crawledContent = new StringBuilder();
    private int maxDepth = 1;
    private int maxPages = 10;
    private int currentPages = 0;

    public WebCrawlerService() {
        disableSSLVerification();
    }

    public void crawl(String startUrl) {
        // Reset state for new crawl
        visitedURLs.clear();
        crawledContent.setLength(0);
        currentPages = 0;

        System.out.println("Starting crawl for: " + startUrl);
        crawlURL(startUrl, 0);

        // Save to a new file (simulated)
        // In a real app, we would append to the data directory
        saveToFile("crawled_data_" + System.currentTimeMillis() + ".csv");
    }

    private void crawlURL(String urlString, int depth) {
        if (depth > maxDepth || currentPages >= maxPages || visitedURLs.contains(urlString)) {
            return;
        }

        try {
            visitedURLs.add(urlString);
            currentPages++;

            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            if (connection.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder pageContent = new StringBuilder();
                while ((line = reader.readLine()) != null) {
                    pageContent.append(line).append("\n");
                }
                reader.close();

                String text = extractText(pageContent.toString());
                crawledContent.append(text).append("\n");

                if (depth < maxDepth) {
                    List<String> links = extractLinks(pageContent.toString(), urlString);
                    for (String link : links) {
                        crawlURL(link, depth + 1);
                    }
                }
            }
            connection.disconnect();
        } catch (Exception e) {
            System.out.println("Error crawling " + urlString + ": " + e.getMessage());
        }
    }

    private String extractText(String html) {
        // Basic HTML text extraction (simplified)
        return html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }

    private List<String> extractLinks(String html, String baseUrl) {
        List<String> links = new ArrayList<>();
        Pattern pattern = Pattern.compile("href=['\"]([^'\"]+)['\"]", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(html);
        while (matcher.find()) {
            String link = matcher.group(1);
            if (link.startsWith("http")) {
                links.add(link);
            }
        }
        return links;
    }

    private void saveToFile(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println(crawledContent.toString());
            System.out.println("Saved crawled data to " + filename);
        } catch (IOException e) {
            System.out.println("Error saving file: " + e.getMessage());
        }
    }

    private void disableSSLVerification() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[] {
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        }
                    }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
