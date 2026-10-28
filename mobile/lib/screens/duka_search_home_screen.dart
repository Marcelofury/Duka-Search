import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/search_providers.dart';
import '../services/typesense_search_service.dart';
import '../theme/neumorphic_theme.dart';
import '../widgets/neumorphic_container.dart';

class DukaSearchHomeScreen extends ConsumerStatefulWidget {
  const DukaSearchHomeScreen({super.key});

  @override
  ConsumerState<DukaSearchHomeScreen> createState() =>
      _DukaSearchHomeScreenState();
}

class _DukaSearchHomeScreenState extends ConsumerState<DukaSearchHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  late final TypesenseSearchService _searchService;

  String _selectedCategory = 'All';
  String _selectedMarket = 'All';
  int _searchLatencyMs = 2;
  int _requestId = 0;
  bool _isLoading = false;
  bool _usingDemoData = false;
  String? _searchError;

  List<DukaItem> _items = [];
  Map<String, List<FacetCount>> _facets = {};
  List<String> _categoryOptions = const ['All'];
  List<String> _marketOptions = const ['All'];

  final currencyFormatter = NumberFormat('#,###', 'en_US');

  @override
  void initState() {
    super.initState();
    _searchService = ref.read(typesenseSearchServiceProvider);
    _performSearch('');
  }

  Future<void> _performSearch(String query) async {
    final requestId = ++_requestId;
    setState(() => _isLoading = true);

    try {
      final results = await _searchService.searchItems(
        query: query,
        categoryFilter: _selectedCategory == 'All' ? null : _selectedCategory,
        marketFilter: _selectedMarket == 'All' ? null : _selectedMarket,
      );

      if (!mounted || results.isCancelled || requestId != _requestId) {
        return;
      }

      setState(() {
        _items = results.items;
        _facets = results.facets;
        _searchLatencyMs = results.searchTimeMs;
        _usingDemoData = results.usedFallback;
        _searchError = results.usedFallback ? null : results.errorMessage;
        _isLoading = false;
        _updateFacetOptions();
      });
    } on DukaSearchException catch (error) {
      if (!mounted || requestId != _requestId) return;
      setState(() {
        _items = const [];
        _searchLatencyMs = 0;
        _usingDemoData = false;
        _searchError = error.message;
        _isLoading = false;
      });
    }
  }

  void _updateFacetOptions() {
    final categoryValues =
        _facets['category']?.map((facet) => facet.value).toList() ?? const [];
    final marketValues =
        _facets['market_location']?.map((facet) => facet.value).toList() ??
            const [];

    if (categoryValues.isNotEmpty && _selectedCategory == 'All') {
      _categoryOptions = ['All', ...categoryValues];
    } else if (_categoryOptions.length <= 1) {
      _categoryOptions = [
        'All',
        ...categoryValues,
        if (_selectedCategory != 'All' &&
            !categoryValues.contains(_selectedCategory))
          _selectedCategory,
      ];
    }

    if (marketValues.isNotEmpty && _selectedMarket == 'All') {
      _marketOptions = ['All', ...marketValues];
    } else if (_marketOptions.length <= 1) {
      _marketOptions = [
        'All',
        ...marketValues,
        if (_selectedMarket != 'All' && !marketValues.contains(_selectedMarket))
          _selectedMarket,
      ];
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeumorphicThemeColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopAppBar(),
            _buildSunkenSearchBar(),
            if (_usingDemoData || _searchError != null) _buildStatusBanner(),
            _buildFacetCategoryChips(),
            _buildMarketLocationFilter(),
            Expanded(child: _buildProductGrid()),
          ],
        ),
      ),
    );
  }

  /// Top App Bar with Violet Dusk Branding
  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'DukaSearch',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      color: NeumorphicThemeColors.textPrimary,
                      fontWeight: FontWeight.w800,
                      fontSize: 24,
                    ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Kampala Hyper-Local Market Index',
                style: TextStyle(
                  fontSize: 12,
                  color: NeumorphicThemeColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          // Tactile Notification / Status Button
          NeumorphicContainer(
            borderRadius: 14,
            padding: const EdgeInsets.all(10),
            depth: 4,
            child: const Icon(
              Icons.storefront_rounded,
              color: NeumorphicThemeColors.accentPurple,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  /// Sunken / Inset Search Bar with real-time latency metric badge ("⚡ 3ms")
  Widget _buildSunkenSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
      child: NeumorphicContainer(
        isInset: true,
        borderRadius: 20,
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        child: Row(
          children: [
            const Icon(
              Icons.search_rounded,
              color: NeumorphicThemeColors.accentPurple,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: (val) => _performSearch(val),
                style: const TextStyle(
                  color: NeumorphicThemeColors.textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
                decoration: const InputDecoration(
                  hintText: 'Search Nakasero, Owino, Ndeeba...',
                  hintStyle: TextStyle(
                    color: NeumorphicThemeColors.textSecondary,
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                ),
              ),
            ),
            if (_searchController.text.isNotEmpty)
              GestureDetector(
                onTap: () {
                  _searchController.clear();
                  _performSearch('');
                },
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.0),
                  child: Icon(
                    Icons.close_rounded,
                    color: NeumorphicThemeColors.textSecondary,
                    size: 18,
                  ),
                ),
              ),
            // Real-time Typesense latency metric badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: NeumorphicThemeColors.darkShadow,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color:
                      NeumorphicThemeColors.accentCyan.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    '⚡',
                    style: TextStyle(fontSize: 10),
                  ),
                  const SizedBox(width: 3),
                  Text(
                    _isLoading ? '...' : '${_searchLatencyMs}ms',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: NeumorphicThemeColors.accentCyan,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner() {
    final isError = _searchError != null;
    final color =
        isError ? const Color(0xFFFF6B8A) : NeumorphicThemeColors.accentCyan;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 2.0),
      child: NeumorphicContainer(
        borderRadius: 12,
        depth: 3,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Icon(
              isError ? Icons.cloud_off_rounded : Icons.science_rounded,
              size: 14,
              color: color,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                isError
                    ? _searchError!
                    : 'Demo data active. Start Typesense to load live market results.',
                style: const TextStyle(
                  fontSize: 11,
                  color: NeumorphicThemeColors.textSecondary,
                  height: 1.3,
                ),
              ),
            ),
            GestureDetector(
              onTap: () => _performSearch(_searchController.text),
              child: Text(
                'Retry',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Dynamic Neumorphic Facet Chips showing active counts (e.g. "Produce (12)")
  Widget _buildFacetCategoryChips() {
    final categoryCounts = <String, int>{};
    if (_facets.containsKey('category')) {
      for (final fc in _facets['category']!) {
        categoryCounts[fc.value] = fc.count;
      }
    }

    return Container(
      height: 48,
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        scrollDirection: Axis.horizontal,
        itemCount: _categoryOptions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final cat = _categoryOptions[index];
          final isSelected = _selectedCategory == cat;
          final count = categoryCounts[cat];

          return GestureDetector(
            onTap: () {
              setState(() => _selectedCategory = cat);
              _performSearch(_searchController.text);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected
                    ? NeumorphicThemeColors.accentPurple.withValues(alpha: 0.2)
                    : NeumorphicThemeColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? NeumorphicThemeColors.accentPurple
                      : NeumorphicThemeColors.subtleBorder,
                  width: isSelected ? 1.5 : 1.0,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: NeumorphicThemeColors.accentPurple
                              .withValues(alpha: 0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : [
                        const BoxShadow(
                          color: NeumorphicThemeColors.lightShadow,
                          offset: Offset(-3, -3),
                          blurRadius: 6,
                        ),
                        const BoxShadow(
                          color: NeumorphicThemeColors.darkShadow,
                          offset: Offset(3, 3),
                          blurRadius: 6,
                        ),
                      ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    cat,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected
                          ? NeumorphicThemeColors.textPrimary
                          : NeumorphicThemeColors.textSecondary,
                    ),
                  ),
                  if (count != null && count > 0) ...[
                    const SizedBox(width: 6),
                    Text(
                      '($count)',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? NeumorphicThemeColors.accentCyan
                            : NeumorphicThemeColors.textSecondary
                                .withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Market Location Horizontal Scroll Filter
  Widget _buildMarketLocationFilter() {
    return Container(
      height: 36,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        scrollDirection: Axis.horizontal,
        itemCount: _marketOptions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final market = _marketOptions[index];
          final isSelected = _selectedMarket == market;

          return GestureDetector(
            onTap: () {
              setState(() => _selectedMarket = market);
              _performSearch(_searchController.text);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected
                    ? NeumorphicThemeColors.lightShadow
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 13,
                    color: isSelected
                        ? NeumorphicThemeColors.accentCyan
                        : NeumorphicThemeColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    market,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected
                          ? NeumorphicThemeColors.textPrimary
                          : NeumorphicThemeColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// 2-Column Grid of Extruded Product Cards
  Widget _buildProductGrid() {
    if (_isLoading && _items.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          color: NeumorphicThemeColors.accentPurple,
        ),
      );
    }

    if (_searchError != null && _items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.cloud_off_rounded,
                size: 48,
                color: Color(0xFFFF6B8A),
              ),
              const SizedBox(height: 12),
              const Text(
                'Search is unavailable',
                style: TextStyle(
                  color: NeumorphicThemeColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _searchError!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: NeumorphicThemeColors.textSecondary,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 16),
              NeumorphicContainer(
                borderRadius: 14,
                depth: 4,
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                onTap: () => _performSearch(_searchController.text),
                child: const Text(
                  'Retry search',
                  style: TextStyle(
                    color: NeumorphicThemeColors.accentCyan,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.search_off_rounded,
              size: 48,
              color: NeumorphicThemeColors.textSecondary,
            ),
            const SizedBox(height: 12),
            const Text(
              'No market items found',
              style: TextStyle(
                color: NeumorphicThemeColors.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Try adjusting your search terms or filters',
              style: TextStyle(
                color:
                    NeumorphicThemeColors.textSecondary.withValues(alpha: 0.8),
                fontSize: 13,
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.74,
        crossAxisSpacing: 14,
        mainAxisSpacing: 16,
      ),
      itemCount: _items.length,
      itemBuilder: (context, index) {
        final item = _items[index];
        return _buildExtrudedProductCard(item);
      },
    );
  }

  /// Extruded / Raised 3D tactile Product Card
  Widget _buildExtrudedProductCard(DukaItem item) {
    return NeumorphicContainer(
      borderRadius: 18,
      depth: 5,
      padding: const EdgeInsets.all(12),
      onTap: () {
        _showItemDetails(item);
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Market badge & category header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item.category.toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: NeumorphicThemeColors.accentPurple,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              if (item.inStock)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: NeumorphicThemeColors.accentCyan,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),

          // Product Name (with highlighted search match text)
          Expanded(child: _buildHighlightedName(item)),
          const SizedBox(height: 6),

          // Vendor & Market Location
          Row(
            children: [
              const Icon(
                Icons.store_mall_directory_outlined,
                size: 11,
                color: NeumorphicThemeColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  item.vendorName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    color: NeumorphicThemeColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              const Icon(
                Icons.place_outlined,
                size: 11,
                color: NeumorphicThemeColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  item.marketLocation,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 10,
                    color: NeumorphicThemeColors.textSecondary
                        .withValues(alpha: 0.85),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Price in UGX with Neumorphic CTA
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'UGX',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: NeumorphicThemeColors.accentCyan,
                    ),
                  ),
                  Text(
                    currencyFormatter.format(item.priceUgx),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: NeumorphicThemeColors.textPrimary,
                    ),
                  ),
                ],
              ),
              // Tactile Action Button
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: NeumorphicThemeColors.lightShadow,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 10,
                  color: NeumorphicThemeColors.accentPurple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHighlightedName(DukaItem item) {
    const baseStyle = TextStyle(
      fontSize: 13,
      fontWeight: FontWeight.w700,
      color: NeumorphicThemeColors.textPrimary,
      height: 1.25,
    );
    const matchStyle = TextStyle(
      fontSize: 13,
      fontWeight: FontWeight.w800,
      color: NeumorphicThemeColors.accentCyan,
      backgroundColor: Color(0x339D4EDD),
      height: 1.25,
    );

    final highlighted = item.highlightedName;
    if (highlighted == null || !highlighted.contains('<mark>')) {
      return Text(
        item.name,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: baseStyle,
      );
    }

    final spans = <TextSpan>[];
    final regex = RegExp(
      r'<mark>(.*?)</mark>',
      caseSensitive: false,
      dotAll: true,
    );
    var cursor = 0;

    for (final match in regex.allMatches(highlighted)) {
      if (match.start > cursor) {
        spans.add(TextSpan(
          text: _decodeHtml(highlighted.substring(cursor, match.start)),
        ));
      }
      spans.add(TextSpan(
        text: _decodeHtml(match.group(1) ?? ''),
        style: matchStyle,
      ));
      cursor = match.end;
    }

    if (cursor < highlighted.length) {
      spans.add(TextSpan(text: _decodeHtml(highlighted.substring(cursor))));
    }

    return Text.rich(
      TextSpan(style: baseStyle, children: spans),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  String _decodeHtml(String value) {
    return value
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'");
  }

  void _showItemDetails(DukaItem item) {
    showModalBottomSheet(
      context: context,
      backgroundColor: NeumorphicThemeColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.category,
                    style: const TextStyle(
                      color: NeumorphicThemeColors.accentPurple,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    'UGX ${currencyFormatter.format(item.priceUgx)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: NeumorphicThemeColors.accentCyan,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                item.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: NeumorphicThemeColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                item.description.isNotEmpty
                    ? item.description
                    : 'Authentic local market item traded directly in Kampala.',
                style: const TextStyle(
                  color: NeumorphicThemeColors.textSecondary,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.pin_drop_rounded,
                      color: NeumorphicThemeColors.accentPurple, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    '${item.marketLocation} · Vendor: ${item.vendorName}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: NeumorphicThemeColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeumorphicThemeColors.accentPurple,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text(
                    'Contact Vendor via WhatsApp / Call',
                    style: TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
