#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// // WiFi credentials
const char* ssid     = "xxxx";
const char* password = "xxxx";

// // Server settings
const char* serverHost = "192.168.1.111";  // replace with your server IP
const int   serverPort = 3000;

// Buffer for incoming serial data
String inputBuffer;

void setup() {
  // Initialize serial on RX0 to receive from Arduino TX (pin 1)
  Serial.begin(9600);

  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println();
  Serial.println("WiFi connected");
}

void loop() {
  // Read temperature string until newline
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      float temperature = inputBuffer.toFloat();
      sendToServer(temperature);
      Serial.println(temperature);
      inputBuffer = "";
    } else {
      inputBuffer += c;
    }
  }
}

void sendToServer(float temperature) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;

  String url = String("http://") + serverHost + ":" + String(serverPort) + "/temperature";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<64> doc;
  doc["temperature"] = temperature;
  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  Serial.print("HTTP Code: ");
  Serial.println(httpCode);
  if (httpCode > 0) {
    Serial.println(http.getString());
  }
  http.end();
}
