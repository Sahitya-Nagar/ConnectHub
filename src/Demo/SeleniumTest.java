package Demo;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.FileWriter;
import java.time.Duration;
import java.util.*;
import java.util.logging.LogManager;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeleniumTest {
    public static void main(String[] args) {
        // shutting off those annoying logs that clutter my console
        LogManager.getLogManager().reset();
        System.setProperty("webdriver.chrome.silentOutput", "true");

        // pointing to where I downloaded chromedriver on my laptop
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\Sahitya Nagar\\Dropbox\\PC\\Downloads\\Lab Codes\\Project - 1\\ChromeDriver\\chromedriver-win64\\chromedriver.exe");

        // setting up chrome so it doesn't give me errors
        ChromeOptions chromeSettings = new ChromeOptions();
        chromeSettings.addArguments("--remote-allow-origins=*");
        chromeSettings.addArguments("start-maximized");

        WebDriver browser = new ChromeDriver(chromeSettings);
        WebDriverWait waiter = new WebDriverWait(browser, Duration.ofSeconds(15));

        // these are the virgin plus pages I need to scrape for my assignment
        String[] websiteLinks = {
                "https://www.virginplus.ca/en/plans/postpaid.html",
                "https://www.virginplus.ca/en/prepaid-plans.html",
                "https://www.virginplus.ca/en/internet/index.html"
        };
        String[] pageNames = {"Postpaid Mobile Plans", "Prepaid Mobile Plans", "Home Internet"};

        // using a map to keep track of how many plans found per page
        Map<String, Integer> plansPerPage = new LinkedHashMap<>();
        // this set helps me avoid adding the same plan twice
        Set<String> alreadySeen = new HashSet<>();

        try (FileWriter csvWriter = new FileWriter("virgin_plans.csv")) {
            // putting column headers at the top of my csv file
            csvWriter.write("Page,Name,Price,Data\n");

            int overallCount = 0;
            for (int pageNum = 0; pageNum < websiteLinks.length; pageNum++) {
                System.out.println("\nScraping " + pageNames[pageNum]);
                browser.get(websiteLinks[pageNum]);

                // waiting a bit for the page to fully load
                try { Thread.sleep(3000); } catch (InterruptedException ignored) {}

                System.out.println("URL: " + browser.getCurrentUrl());
                System.out.println("Title: " + browser.getTitle());

                // only need to close cookie banner on first page
                if (pageNum == 0) {
                    try {
                        WebElement acceptButton = waiter.until(ExpectedConditions.elementToBeClickable(
                                By.cssSelector("button[id*='accept'], button[id*='consent'], .accept-cookies")));
                        acceptButton.click();
                        System.out.println("✓ Closed cookie popup");
                    } catch (Exception ex) {
                        System.out.println("No cookie popup");
                    }
                }

                // scrolling down slowly so all content loads properly
                for (int scrollPosition = 0; scrollPosition <= 2000; scrollPosition += 400) {
                    ((JavascriptExecutor) browser).executeScript("window.scrollTo(0," + scrollPosition + ");");
                    try { Thread.sleep(400); } catch (InterruptedException ignored) {}
                }

                // finding all the divs and sections that might have plan info
                List<WebElement> contentBlocks = browser.findElements(By.cssSelector("div, section, article"));
                int plansFound = 0;

                for (WebElement singleBlock : contentBlocks) {
                    String blockText = singleBlock.getText().trim();
                    if (blockText.isEmpty() || blockText.length() < 20) continue; // skipping small stuff

                    // trying to pull out the important details from the text
                    String priceInfo = getPriceFromText(blockText);
                    String dataInfo = getDataFromText(blockText);
                    String nameInfo = getNameFromText(blockText);

                    // if I can't find price or data then it's probably not a plan
                    if (priceInfo.equals("N/A") || dataInfo.equals("N/A")) continue;

                    // filtering out phone deals that snuck in somehow
                    if (priceInfo.contains("900") && dataInfo.contains("128GB")) continue;
                    if (blockText.toLowerCase().contains("samsung") || blockText.toLowerCase().contains("iphone")) continue;

                    // making sure I don't add duplicate plans
                    String uniqueKey = priceInfo + "|" + dataInfo;
                    if (alreadySeen.contains(uniqueKey)) continue;
                    alreadySeen.add(uniqueKey);

                    // got a valid plan! writing it to csv
                    plansFound++;
                    overallCount++;
                    System.out.println("Plan " + plansFound + ": " + nameInfo + " | " + priceInfo + " | " + dataInfo);
                    csvWriter.write(pageNames[pageNum] + ",\"" + nameInfo + "\"," + priceInfo + "," + dataInfo + "\n");
                }

                // keeping track of counts for each page
                plansPerPage.put(pageNames[pageNum], plansFound);
            }

            // printing out final results
            System.out.println("\n --->> SUMMARY ");
            for (String pageName : pageNames) {
                System.out.println(pageName + ": " + plansPerPage.getOrDefault(pageName, 0));
            }
            System.out.println("TOTAL: " + overallCount);
            System.out.println("Data saved to virgin_plans.csv");

        } catch (Exception error) {
            error.printStackTrace();
        } finally {
            browser.quit();
            System.out.println("Browser closed.");
        }
    }

    // helper methods below to extract specific info from text

    // looks for price pattern like $45/mo or $45.00
    private static String getPriceFromText(String textContent) {
        Matcher priceMatcher = Pattern.compile("\\$\\s*\\d+(?:/mo\\.?|\\.\\d{2})?").matcher(textContent);
        return priceMatcher.find() ? priceMatcher.group().replace(" ", "") : "N/A";
    }

    // searches for data amounts like 30GB or speed like 50Mbps
    private static String getDataFromText(String textContent) {
        Matcher gbMatcher = Pattern.compile("\\d+\\s*GB").matcher(textContent);
        if (gbMatcher.find()) return gbMatcher.group();
        Matcher mbpsMatcher = Pattern.compile("\\d+\\s*Mbps").matcher(textContent);
        if (mbpsMatcher.find()) return mbpsMatcher.group();
        if (textContent.toLowerCase().contains("unlimited")) return "Unlimited";
        return "N/A";
    }

    // tries to grab a reasonable plan name from the text
    private static String getNameFromText(String textContent) {
        for (String textLine : textContent.split("\n")) {
            textLine = textLine.trim();
            if (textLine.length() > 5 && !textLine.contains("$") && !textLine.toLowerCase().contains("click")
                    && !textLine.toLowerCase().contains("visit")) {
                return textLine;
            }
        }
        return "Unnamed Plan"; // backup name if nothing good found
    }
}