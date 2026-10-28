import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// "Violet Dusk Neumorphism" Theme Constants
class NeumorphicThemeColors {
  // Primary Background Base
  static const Color background = Color(0xFF1E1B2E);

  // Neumorphic Top-Left Light Highlight Shadow
  static const Color lightShadow = Color(0xFF2A2640);

  // Neumorphic Bottom-Right Dark Deep Shadow
  static const Color darkShadow = Color(0xFF12101C);

  // Accent / Highlights
  static const Color accentPurple = Color(0xFF9D4EDD);
  static const Color accentCyan = Color(0xFF00F5D4);

  // Typography
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA09ABC);

  // Card Borders & Divider
  static const Color subtleBorder = Color(0x1AFFFFFF);
}

class NeumorphicTheme {
  static ThemeData get themeData {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: NeumorphicThemeColors.background,
      primaryColor: NeumorphicThemeColors.accentPurple,
      colorScheme: const ColorScheme.dark(
        primary: NeumorphicThemeColors.accentPurple,
        secondary: NeumorphicThemeColors.accentCyan,
        surface: NeumorphicThemeColors.background,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(
        const TextTheme(
          displayLarge: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: NeumorphicThemeColors.textPrimary,
            letterSpacing: -0.5,
          ),
          titleLarge: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: NeumorphicThemeColors.textPrimary,
          ),
          bodyLarge: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: NeumorphicThemeColors.textPrimary,
          ),
          bodyMedium: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w400,
            color: NeumorphicThemeColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
