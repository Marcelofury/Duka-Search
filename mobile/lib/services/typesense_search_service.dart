import 'dart:convert';
import 'dart:developer' as developer;

import 'package:http/http.dart' as http;

/// Data model representing an item in DukaSearch.
class DukaItem {
  final String id;
  final String name;
  final String category;
  final String vendorName;
  final String marketLocation;
  final int priceUgx;
  final bool inStock;
  final String description;
  final List<double>? location;
  final String? highlightedName;

  const DukaItem({
    required this.id,
    required this.name,
    required this.category,
    required this.vendorName,
    required this.marketLocation,
    required this.priceUgx,
    required this.inStock,
    this.description = '',
    this.location,
    this.highlightedName,
  });

  factory DukaItem.fromTypesense(
    Map<String, dynamic> document, [
    Map<String, dynamic>? highlight,
  ]) {
    String? matchedName;

    final nameHighlight = highlight?['name'];
    if (nameHighlight is Map) {
      matchedName = (nameHighlight['snippet'] ??
              nameHighlight['value'] ??
              nameHighlight['matched'])
          ?.toString();
    }

    return DukaItem(
      id: document['id']?.toString() ?? '',
      name: document['name']?.toString() ?? 'Unnamed Item',
      category: document['category']?.toString() ?? 'General',
      vendorName: document['vendor_name']?.toString() ?? 'Local Trader',
      marketLocation:
          document['market_location']?.toString() ?? 'Kampala Central',
      priceUgx: (document['price_ugx'] as num?)?.toInt() ?? 0,
      inStock: document['in_stock'] == true,
      description: document['description']?.toString() ?? '',
      location: (document['location'] is List)
          ? (document['location'] as List)
              .map((value) => (value as num).toDouble())
              .toList()
          : null,
      highlightedName: matchedName,
    );
  }
}

/// Facet count representation returned by Typesense.
class FacetCount {
  final String value;
  final int count;

  const FacetCount({required this.value, required this.count});
}

/// Search result wrapper containing hits, facets, latency and request state.
class DukaSearchResult {
  final List<DukaItem> items;
  final Map<String, List<FacetCount>> facets;
  final int searchTimeMs;
  final int totalFound;
  final int requestId;
  final bool usedFallback;
  final String? errorMessage;
  final bool isCancelled;

  const DukaSearchResult({
    required this.items,
    required this.facets,
    required this.searchTimeMs,
    required this.totalFound,
    this.requestId = 0,
    this.usedFallback = false,
    this.errorMessage,
    this.isCancelled = false,
  });

  factory DukaSearchResult.cancelled(int requestId) {
    return DukaSearchResult(
      items: const [],
      facets: const {},
      searchTimeMs: 0,
      totalFound: 0,
      requestId: requestId,
      isCancelled: true,
    );
  }
}

/// Thrown when the Typesense search request fails and demo fallback is off.
class DukaSearchException implements Exception {
  final String message;

  const DukaSearchException(this.message);

  @override
  String toString() => message;
}

/// Search service backed by the DukaSearch API proxy.
///
/// The mobile client never talks to Typesense directly: the admin API key
/// stays on the server and search requests go through `GET /api/search`.
///
/// Configure with --dart-define:
///   API_BASE_URL (e.g. https://dukasearch-backend.onrender.com)
class TypesenseSearchService {
  static const String collectionName = 'duka_items';

  static const String _defaultApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://duka-search.onrender.com',
  );

  final bool enableDemoFallback;
  final String _apiBaseUrl;
  final http.Client _httpClient;
  int _requestSequence = 0;

  TypesenseSearchService({
    String? apiBaseUrl,
    http.Client? httpClient,
    this.enableDemoFallback = false,
  })  : _apiBaseUrl = (apiBaseUrl ?? _defaultApiBaseUrl)
            .replaceAll(RegExp(r'/+$'), ''),
        _httpClient = httpClient ?? http.Client();

  /// Instant search with 300ms debouncing, typo tolerance and faceted filters.
  Future<DukaSearchResult> searchItems({
    required String query,
    String? categoryFilter,
    String? marketFilter,
    int page = 1,
    int perPage = 20,
    Duration debounceDuration = const Duration(milliseconds: 300),
  }) async {
    final requestId = ++_requestSequence;
    final trimmedQuery = query.trim();

    await Future<void>.delayed(debounceDuration);

    // A newer keystroke superseded this request while we were debouncing.
    if (requestId != _requestSequence) {
      return DukaSearchResult.cancelled(requestId);
    }

    final stopwatch = Stopwatch()..start();

    try {
      final uri = Uri.parse('$_apiBaseUrl/api/search').replace(
        queryParameters: {
          'q': trimmedQuery,
          'page': '$page',
          'per_page': '$perPage',
          if (categoryFilter != null &&
              categoryFilter.trim().isNotEmpty &&
              categoryFilter != 'All')
            'category': categoryFilter.trim(),
          if (marketFilter != null &&
              marketFilter.trim().isNotEmpty &&
              marketFilter != 'All')
            'market': marketFilter.trim(),
        },
      );

      final response = await _httpClient
          .get(uri, headers: const {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 8));

      stopwatch.stop();

      if (requestId != _requestSequence) {
        return DukaSearchResult.cancelled(requestId);
      }

      if (response.statusCode != 200) {
        throw DukaSearchException(
          'Search failed with status ${response.statusCode}.',
        );
      }

      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const DukaSearchException('Search returned an invalid response.');
      }
      final responseBody = decoded;

      final hits = (responseBody['hits'] as List<dynamic>?) ?? const [];
      final items = hits.map((hit) {
        final hitMap = hit as Map<String, dynamic>;
        final document = hitMap['document'] as Map<String, dynamic>;
        final highlight = hitMap['highlight'] as Map<String, dynamic>?;
        return DukaItem.fromTypesense(document, highlight);
      }).toList();

      final facets = <String, List<FacetCount>>{};
      final facetCounts =
          (responseBody['facet_counts'] as List<dynamic>?) ?? const [];
      for (final rawFacet in facetCounts) {
        final facet = rawFacet as Map<String, dynamic>;
        final fieldName = facet['field_name'] as String?;
        if (fieldName == null) continue;

        facets[fieldName] =
            ((facet['counts'] as List<dynamic>?) ?? const []).map((rawCount) {
          final count = rawCount as Map<String, dynamic>;
          return FacetCount(
            value: count['value']?.toString() ?? '',
            count: (count['count'] as num?)?.toInt() ?? 0,
          );
        }).toList();
      }

      return DukaSearchResult(
        items: items,
        facets: facets,
        searchTimeMs: (responseBody['search_time_ms'] as num?)?.toInt() ??
            stopwatch.elapsedMilliseconds,
        totalFound: (responseBody['found'] as num?)?.toInt() ?? items.length,
        requestId: requestId,
      );
    } catch (error) {
      stopwatch.stop();
      developer.log(
        'Typesense search failed: $error',
        name: 'DukaSearch',
      );

      if (!enableDemoFallback) {
        throw const DukaSearchException(
          'Could not reach the DukaSearch index. Check network/config.',
        );
      }

      return _fallbackResult(
        query: trimmedQuery,
        category: categoryFilter,
        market: marketFilter,
        elapsedMs: stopwatch.elapsedMilliseconds,
        errorMessage: error.toString(),
        requestId: requestId,
      );
    }
  }

  DukaSearchResult _fallbackResult({
    required String query,
    required String? category,
    required String? market,
    required int elapsedMs,
    required String errorMessage,
    required int requestId,
  }) {
    const demoItems = <DukaItem>[
      DukaItem(
        id: 'duka_item_001',
        name: 'Fresh Matooke Cluster (Heavy Green Grade)',
        category: 'Fresh Produce',
        vendorName: 'Mama Nalubega Stalls',
        marketLocation: 'Nakasero Market',
        priceUgx: 35000,
        inStock: true,
        description: 'Farm-fresh organic Matooke harvested from Masaka.',
      ),
      DukaItem(
        id: 'duka_item_002',
        name: 'Toyota Corolla Brake Pads (OEM Ceramic)',
        category: 'Auto Parts',
        vendorName: 'Mugisha Auto Garage',
        marketLocation: 'Ndeeba Spares Hub',
        priceUgx: 140000,
        inStock: true,
        description: 'Genuine ceramic brake pads for Fielder, Premio and Axio.',
      ),
      DukaItem(
        id: 'duka_item_003',
        name: 'Second-Hand Denim Jackets (Grade A Bale)',
        category: 'Second-Hand Apparel',
        vendorName: 'Owino Vintage Outfits',
        marketLocation: 'Owino Market (St. Balikuddembe)',
        priceUgx: 28000,
        inStock: true,
        description:
            'Selected heavy denim vintage jackets in spotless condition.',
      ),
      DukaItem(
        id: 'duka_item_004',
        name: 'Kazinga Natural Raw Honey (1L Jar)',
        category: 'Groceries & Wholesale',
        vendorName: 'Kikuubo Wholesale Center',
        marketLocation: 'Kikuubo Lane',
        priceUgx: 22000,
        inStock: true,
        description:
            'Pure unfiltered organic honey from the Queen Elizabeth basin.',
      ),
      DukaItem(
        id: 'duka_item_005',
        name: 'Pure Sine Wave Solar Inverter 1.5kVA',
        category: 'Hardware & Solar',
        vendorName: 'Katwe Engineering Works',
        marketLocation: 'Katwe Metal Hub',
        priceUgx: 450000,
        inStock: true,
        description:
            'High-frequency solar inverter with built-in PWM controller.',
      ),
      DukaItem(
        id: 'duka_item_008',
        name: 'Kitenge Fabric 6-Yard Wax Print (Ankara)',
        category: 'Textiles & Fashion',
        vendorName: 'Amina Afro Silks',
        marketLocation: 'Owino Market (St. Balikuddembe)',
        priceUgx: 65000,
        inStock: true,
        description:
            'Vibrant colour-fast cotton wax print for traditional wear.',
      ),
      DukaItem(
        id: 'duka_item_011',
        name: 'Super Basmati Long Grain Rice (25kg Sack)',
        category: 'Groceries & Wholesale',
        vendorName: 'Mukwano Allied Traders',
        marketLocation: 'Kikuubo Lane',
        priceUgx: 165000,
        inStock: true,
        description: 'Aromatic premium basmati, double polished for pilau.',
      ),
      DukaItem(
        id: 'duka_item_014',
        name: 'DOT Certified Full Face Boda Helmet',
        category: 'Auto Parts',
        vendorName: 'Boda Safety Supplies',
        marketLocation: 'Wandegeya Market',
        priceUgx: 95000,
        inStock: true,
        description: 'High impact ABS shell helmet with anti-fog visor.',
      ),
    ];

    final normalizedQuery = query.toLowerCase();
    final filtered = demoItems.where((item) {
      if (category != null && category != 'All' && item.category != category) {
        return false;
      }
      if (market != null && market != 'All' && item.marketLocation != market) {
        return false;
      }
      if (normalizedQuery.isEmpty) return true;

      final haystack = '${item.name} ${item.category} ${item.vendorName} '
              '${item.marketLocation} ${item.description}'
          .toLowerCase();
      return haystack.contains(normalizedQuery);
    }).map((item) {
      return DukaItem(
        id: item.id,
        name: item.name,
        category: item.category,
        vendorName: item.vendorName,
        marketLocation: item.marketLocation,
        priceUgx: item.priceUgx,
        inStock: item.inStock,
        description: item.description,
        highlightedName: _highlightMatch(item.name, query),
      );
    }).toList();

    final categoryCounts = <String, int>{};
    final marketCounts = <String, int>{};
    for (final item in filtered) {
      categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
      marketCounts[item.marketLocation] =
          (marketCounts[item.marketLocation] ?? 0) + 1;
    }

    return DukaSearchResult(
      items: filtered,
      facets: {
        'category': categoryCounts.entries
            .map((entry) => FacetCount(value: entry.key, count: entry.value))
            .toList(),
        'market_location': marketCounts.entries
            .map((entry) => FacetCount(value: entry.key, count: entry.value))
            .toList(),
      },
      searchTimeMs: elapsedMs > 0 ? elapsedMs : 3,
      totalFound: filtered.length,
      requestId: requestId,
      usedFallback: true,
      errorMessage: errorMessage,
    );
  }

  String? _highlightMatch(String value, String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return null;

    final index = value.toLowerCase().indexOf(trimmed.toLowerCase());
    if (index < 0) return null;

    return '${value.substring(0, index)}<mark>'
        '${value.substring(index, index + trimmed.length)}</mark>'
        '${value.substring(index + trimmed.length)}';
  }
}
