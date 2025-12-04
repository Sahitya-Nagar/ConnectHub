import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.net.InetSocketAddress;

public class BackendServer {

    private static final int PORT = 8080;
    private static SearchEngine searchEngine;
    private static SpellChecker spellChecker;
    private static WordCompletion wordCompletion;
    private static WebCrawlerService webCrawler;

    public static void main(String[] args) throws IOException {
        // Initialize services
        searchEngine = new SearchEngine();
        spellChecker = new SpellChecker();
        wordCompletion = new WordCompletion();
        webCrawler = new WebCrawlerService();

        // Load initial data
        loadData();

        // Start Server
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Define endpoints
        server.createContext("/api/search", new SearchHandler());
        server.createContext("/api/suggest", new SuggestHandler());
        server.createContext("/api/spellcheck", new SpellCheckHandler());
        server.createContext("/api/crawl", new CrawlHandler());
        server.createContext("/api/frequency", new FrequencyHandler());
        server.createContext("/api/history", new HistoryHandler());
        server.createContext("/api/plans", new PlansHandler());

        // CORS for all endpoints
        server.createContext("/", new CorsHandler());

        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println("Server started on port " + PORT);
    }

    private static void loadData() {
        System.out.println("Loading data...");
        // Load CSVs and initialize engines
        String[] csvFiles = {
                "../bell_plans.csv",
                "../rogers_plans.csv",
                "../virgin_plans.csv",
                "../att_internet_plans_final.csv",
                "../koodo_plans.csv",
                "../fido_plans.csv",
                "../freedom_plans.csv"
        };

        for (String file : csvFiles) {
            File f = new File(file);
            if (f.exists()) {
                searchEngine.indexFile(f);
                spellChecker.buildVocabulary(f);
                wordCompletion.buildTrie(f);
            } else {
                System.out.println("Warning: File not found: " + file);
            }
        }
        System.out.println("Data loaded.");
    }

    // --- Handlers ---

    static class CorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
            exchange.close();
        }
    }

    static class SearchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String query = getQueryParam(exchange, "query");
                if (query != null) {
                    String results = searchEngine.search(query);
                    sendResponse(exchange, results);
                } else {
                    sendResponse(exchange, "[]");
                }
            }
        }
    }

    static class SuggestHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String prefix = getQueryParam(exchange, "prefix");
                if (prefix != null) {
                    String suggestions = wordCompletion.getSuggestions(prefix);
                    sendResponse(exchange, suggestions);
                } else {
                    sendResponse(exchange, "[]");
                }
            }
        }
    }

    static class SpellCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String word = getQueryParam(exchange, "word");
                if (word != null) {
                    String correction = spellChecker.check(word);
                    sendResponse(exchange, "{\"correction\": \"" + correction + "\"}");
                } else {
                    sendResponse(exchange, "{}");
                }
            }
        }
    }

    static class CrawlHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                String url = getQueryParam(exchange, "url");
                if (url != null) {
                    webCrawler.crawl(url);
                    // Re-index after crawl
                    // For simplicity, we might just add to index dynamically or reload
                    sendResponse(exchange, "{\"status\": \"crawling_started\", \"url\": \"" + url + "\"}");
                } else {
                    sendResponse(exchange, "{\"error\": \"missing_url\"}");
                }
            }
        }
    }

    static class FrequencyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String stats = searchEngine.getFrequencyStats();
                sendResponse(exchange, stats);
            }
        }
    }

    static class HistoryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String history = searchEngine.getSearchHistory();
                sendResponse(exchange, history);
            }
        }
    }

    static class PlansHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String plans = searchEngine.getAllPlans();
                sendResponse(exchange, plans);
            }
        }
    }

    // --- Helpers ---

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    private static String getQueryParam(HttpExchange exchange, String param) {
        String query = exchange.getRequestURI().getQuery();
        if (query == null)
            return null;
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=");
            if (parts.length > 1 && parts[0].equals(param)) {
                return parts[1];
            }
        }
        return null;
    }

    private static void sendResponse(HttpExchange exchange, String response) throws IOException {
        byte[] bytes = response.getBytes("UTF-8");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
