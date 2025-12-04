import java.io.*;
import java.util.*;

public class SearchEngine {

    // Inverted Index: Word -> List of (File, Count)
    private Map<String, Map<String, Integer>> invertedIndex = new HashMap<>();

    // Search History: Word -> Count
    private Map<String, Integer> searchHistory = new HashMap<>();

    // Structured Plans Data
    private List<InternetPlan> allPlans = new ArrayList<>();

    public static class InternetPlan {
        public String provider;
        public String planName;
        public String price;
        public String speed;
        public String data;
        public String features;
        public String category;
        public String url;

        public InternetPlan(String provider, String planName, String price, String speed, String data, String features,
                String category, String url) {
            this.provider = provider;
            this.planName = planName;
            this.price = price;
            this.speed = speed;
            this.data = data;
            this.features = features;
            this.category = category;
            this.url = url;
        }

        public String toJson() {
            return String.format(
                    "{\"provider\":\"%s\",\"planName\":\"%s\",\"price\":\"%s\",\"speed\":\"%s\",\"data\":\"%s\",\"features\":\"%s\",\"category\":\"%s\",\"url\":\"%s\"}",
                    escapeJsonValue(provider), escapeJsonValue(planName), escapeJsonValue(price),
                    escapeJsonValue(speed), escapeJsonValue(data), escapeJsonValue(features),
                    escapeJsonValue(category), escapeJsonValue(url));
        }

        private static String escapeJsonValue(String s) {
            if (s == null)
                return "";
            return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
        }
    }

    public void indexFile(File file) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            String fileName = file.getName();
            String provider = getProviderFromFileName(fileName);
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header row
                }

                if (line.trim().isEmpty())
                    continue;

                // Parse and store structured plan
                InternetPlan plan = parsePlanFromCSV(line, provider, fileName);
                if (plan != null && !plan.price.equals("N/A")) {
                    allPlans.add(plan);

                    // Index words from plan for search
                    indexWords(plan.planName, fileName);
                    indexWords(plan.provider, fileName);
                    indexWords(plan.features, fileName);
                    indexWords(plan.category, fileName);
                }
            }
        } catch (IOException e) {
            System.out.println("Error indexing file: " + file.getName());
        }
    }

    private void indexWords(String text, String fileName) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }

        // Split text into words and index each one
        String[] words = text.toLowerCase().split("\\s+");
        for (String word : words) {
            // Clean the word (remove special characters, keep only alphanumeric)
            word = word.replaceAll("[^a-z0-9]", "").trim();

            if (word.isEmpty() || word.length() < 2) {
                continue; // Skip empty or single-character words
            }

            // Add to inverted index
            invertedIndex.putIfAbsent(word, new HashMap<>());
            Map<String, Integer> fileMap = invertedIndex.get(word);
            fileMap.put(fileName, fileMap.getOrDefault(fileName, 0) + 1);
        }
    }

    private String getProviderFromFileName(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.contains("bell"))
            return "Bell";
        if (lower.contains("rogers"))
            return "Rogers";
        if (lower.contains("virgin"))
            return "Virgin Plus";
        if (lower.contains("att"))
            return "AT&T";
        if (lower.contains("koodo"))
            return "Koodo";
        if (lower.contains("fido"))
            return "Fido";
        if (lower.contains("freedom"))
            return "Freedom Mobile";
        return "Unknown";
    }

    private InternetPlan parsePlanFromCSV(String line, String provider, String fileName) {
        String[] parts = line.split(",");

        // Bell format: Plan Type,Plan Name,Price,Speed/Data,Features,Page URL,Scrape
        // Time
        if (fileName.contains("bell")) {
            if (parts.length >= 4) {
                String planName = parts.length > 1 ? parts[1].trim() : "Internet Plan";
                String price = parts.length > 2 ? extractPrice(parts[2]) : "N/A";
                String speed = parts.length > 3 ? parts[3].trim() : "N/A";
                String data = "Unlimited";
                String features = parts.length > 4 ? parts[4].trim() : "";
                String category = parts.length > 0 ? parts[0].trim() : "Internet";
                String url = parts.length > 5 ? parts[5].trim() : "";
                return new InternetPlan(provider, planName, price, speed, data, features, category, url);
            }
        }

        // AT&T format: Plan Name,Price,Speed,Connection Type,Data Cap,Features,Region
        if (fileName.contains("att")) {
            if (parts.length >= 3) {
                String planName = parts.length > 0 ? parts[0].trim() : "Internet Plan";
                String price = parts.length > 1 ? extractPrice(parts[1]) : "N/A";
                String speed = parts.length > 2 ? parts[2].trim() : "N/A";
                String data = parts.length > 4 ? parts[4].trim() : "Unlimited";
                String features = parts.length > 5 ? parts[5].trim() : "";
                String url = parts.length > 7 ? parts[7].trim() : "";
                return new InternetPlan(provider, planName, price, speed, data, features, "Home Internet", url);
            }
        }

        // Rogers format: Provider,,Price,DownloadSpeed,,URL
        if (fileName.contains("rogers")) {
            if (parts.length >= 3) {
                String price = parts.length > 2 ? extractPrice(parts[2]) : "N/A";
                String speed = parts.length > 3 ? parts[3].trim() : "N/A";
                String planName = "Rogers Internet " + speed;
                String url = parts.length > 5 ? parts[5].trim() : "";
                return new InternetPlan(provider, planName, price, speed, "Unlimited", "High-speed internet",
                        "Home Internet", url);
            }
        }

        // Virgin format: Category,Plan_Name,Monthly_Price,Data_Speed,Raw_Content
        if (fileName.contains("virgin")) {
            if (parts.length >= 4) {
                String category = parts.length > 0 ? parts[0].replace("\"", "").trim() : "Internet";
                String planName = parts.length > 1 ? parts[1].replace("\"", "").trim() : "Internet Plan";
                String price = parts.length > 2 ? extractPrice(parts[2]) : "N/A";
                String speed = parts.length > 3 ? parts[3].replace("\"", "").trim() : "N/A";
                String url = parts.length > 4 ? parts[4].trim() : "";
                return new InternetPlan(provider, planName, price, speed, "Unlimited", "Unlimited data", category, url);
            }
        }

        // Koodo format: Plan Name,Price,Data,Features
        if (fileName.contains("koodo")) {
            if (parts.length >= 3) {
                String planName = parts.length > 0 ? parts[0].trim() : "Koodo Plan";
                String price = parts.length > 1 ? extractPrice(parts[1]) : "N/A";
                String data = parts.length > 2 ? parts[2].trim() : "N/A";
                String features = parts.length > 3 ? parts[3].trim() : "";

                // Determine if it's internet or mobile based on plan name or data
                String category = planName.toLowerCase().contains("internet") ||
                        data.toLowerCase().contains("mbps") ||
                        data.toLowerCase().contains("gbps") ? "Home Internet" : "Mobile";
                String speed = category.equals("Home Internet") ? data : "4G/5G";
                String dataAmount = category.equals("Home Internet") ? "Unlimited" : data;

                return new InternetPlan(provider, planName, price, speed, dataAmount, features, category, "");
            }
        }

        // Generic format (Fido/Freedom): Provider,Plan Name,Price,Speed,Data
        if (fileName.contains("fido") || fileName.contains("freedom")) {
            if (parts.length >= 5) {
                String planName = parts[1].trim();
                String price = extractPrice(parts[2]);
                String speed = parts[3].trim();
                String data = parts[4].trim();
                return new InternetPlan(provider, planName, price, speed, data, "Mobile Plan", "Mobile", "");
            }
        }

        return null;
    }

    private String extractPrice(String text) {
        // Extract price from various formats like "$50/mo", "$50.00 per month", etc.
        text = text.replaceAll("\"", "").trim();
        if (text.matches(".*\\$\\d+.*")) {
            String price = text.replaceAll("[^$0-9.]", "");
            if (price.startsWith("$")) {
                return price.split("\\.")[0]; // Return just $XX without cents
            }
        }
        return "N/A";
    }

    public String search(String query) {
        String lowerQuery = query.toLowerCase().trim();
        searchHistory.put(lowerQuery, searchHistory.getOrDefault(lowerQuery, 0) + 1);

        if (!invertedIndex.containsKey(lowerQuery)) {
            return "[]";
        }

        Map<String, Integer> results = invertedIndex.get(lowerQuery);
        List<Map.Entry<String, Integer>> sortedResults = new ArrayList<>(results.entrySet());
        sortedResults.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < sortedResults.size(); i++) {
            Map.Entry<String, Integer> entry = sortedResults.get(i);
            String fileName = escapeJsonValue(entry.getKey());
            json.append(String.format("{\"file\": \"%s\", \"count\": %d}", fileName, entry.getValue()));
            if (i < sortedResults.size() - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    public String getAllPlans() {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < allPlans.size(); i++) {
            json.append(allPlans.get(i).toJson());
            if (i < allPlans.size() - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    public String getFrequencyStats() {
        Map<String, Integer> totalFreq = new HashMap<>();
        for (Map.Entry<String, Map<String, Integer>> entry : invertedIndex.entrySet()) {
            int sum = entry.getValue().values().stream().mapToInt(Integer::intValue).sum();
            totalFreq.put(entry.getKey(), sum);
        }

        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(totalFreq.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        StringBuilder json = new StringBuilder("[");
        int limit = Math.min(20, sorted.size());
        for (int i = 0; i < limit; i++) {
            String word = escapeJsonValue(sorted.get(i).getKey());
            json.append(String.format("{\"word\": \"%s\", \"count\": %d}", word,
                    sorted.get(i).getValue()));
            if (i < limit - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    public String getSearchHistory() {
        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(searchHistory.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < sorted.size(); i++) {
            String term = escapeJsonValue(sorted.get(i).getKey());
            json.append(String.format("{\"term\": \"%s\", \"count\": %d}", term,
                    sorted.get(i).getValue()));
            if (i < sorted.size() - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    private static String escapeJsonValue(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "").replace("\t", " ");
    }
}
