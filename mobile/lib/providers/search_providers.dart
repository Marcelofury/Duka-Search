import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/typesense_search_service.dart';

/// Single shared Typesense search client for the app session.
final typesenseSearchServiceProvider = Provider<TypesenseSearchService>((ref) {
  return TypesenseSearchService();
});
