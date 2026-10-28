import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/duka_search_home_screen.dart';
import 'theme/neumorphic_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: NeumorphicThemeColors.background,
    ),
  );
  runApp(const ProviderScope(child: DukaSearchApp()));
}

class DukaSearchApp extends StatelessWidget {
  const DukaSearchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DukaSearch',
      debugShowCheckedModeBanner: false,
      theme: NeumorphicTheme.themeData,
      home: const DukaSearchHomeScreen(),
    );
  }
}
