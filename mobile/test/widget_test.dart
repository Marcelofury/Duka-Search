import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dukasearch/main.dart';

void main() {
  testWidgets('DukaSearch renders the market home screen', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: DukaSearchApp()),
    );
    await tester.pump(const Duration(milliseconds: 400));

    expect(find.text('DukaSearch'), findsWidgets);
    expect(find.byType(TextField), findsOneWidget);
  });
}
