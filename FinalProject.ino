const int potPin1 = A0; // Potentiometer 1 (color)
const int potPin2 = A2; // Potentiometer 2 (shape type)
const int potPin3 = A4; // Potentiometer 3 (size scaling)

void setup() {
  Serial.begin(9600);
}

void loop() {
  // Read values from the potentiometers (0 to 4095)
  int potValue1 = analogRead(potPin1); // For color
  int potValue2 = analogRead(potPin2); // For shape type
  int potValue3 = analogRead(potPin3); // For size scaling

  Serial.print(potValue1);
  Serial.print(",");
  Serial.print(potValue2);
  Serial.print(",");
  Serial.println(potValue3);

  delay(50);
}
