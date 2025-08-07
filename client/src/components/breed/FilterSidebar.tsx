import { X, Search, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";

const sizeOptions = [
  { value: "toy", label: "Toy", description: "2-12 lbs" },
  { value: "small", label: "Small", description: "12-25 lbs" },
  { value: "medium", label: "Medium", description: "25-60 lbs" },
  { value: "large", label: "Large", description: "60+ lbs" },
];

const experienceOptions = [
  { value: "beginner", label: "First-Time Owner" },
  { value: "intermediate", label: "Some Experience" },
  { value: "expert", label: "Very Experienced" },
];

const savedFilters = [
  {
    id: "family-friendly",
    name: "Family Friendly",
    description: "Large, good with kids, easy training",
  },
  {
    id: "apartment-living",
    name: "Apartment Living",
    description: "Small-medium, low energy, quiet",
  },
];

export default function FilterSidebar() {
  const {
    isFilterSidebarOpen,
    toggleFilterSidebar,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    resetFilters,
    showToast,
  } = useStore();

  const handleApplyFilters = () => {
    // Apply filters logic would be implemented here
    showToast("Filters applied successfully", "success");
    toggleFilterSidebar();
  };

  const handleSaveFilter = () => {
    // Save filter logic would be implemented here
    showToast("Filter saved successfully", "success");
  };

  const handleLoadSavedFilter = (filterId: string) => {
    // Load saved filter logic based on filterId
    const filterPresets = {
      "family-friendly": {
        size: ["large"],
        goodWithChildren: true,
        energyLevel: 3,
        experience: "beginner",
      },
      "apartment-living": {
        size: ["small", "medium"],
        energyLevel: 2,
        apartmentFriendly: true,
      },
    };
    
    const preset = filterPresets[filterId as keyof typeof filterPresets];
    if (preset) {
      updateFilters(preset);
      showToast(`"${savedFilters.find(f => f.id === filterId)?.name}" filter applied`, "success");
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-96 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ${
        isFilterSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      data-testid="filter-sidebar"
    >
      <div className="h-full overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-montserrat font-bold text-xl text-midnight">Advanced Filters</h3>
          <Button
            onClick={toggleFilterSidebar}
            size="sm"
            variant="ghost"
            className="p-2 rounded-xl hover:bg-softgray transition-colors"
            data-testid="close-filters"
          >
            <X className="w-6 h-6 text-midnight" />
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-midnight mb-2">Search Breeds</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Type breed name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-softgray rounded-2xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all"
              data-testid="search-breeds-input"
            />
            <Search className="w-5 h-5 text-midnight/60 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Filter Groups */}
        <div className="space-y-6">
          
          {/* Size */}
          <div>
            <Label className="block text-sm font-medium text-midnight mb-3">Dog Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {sizeOptions.map((size) => (
                <label key={size.value} className="cursor-pointer">
                  <input type="checkbox" className="sr-only" />
                  <div
                    className={`p-3 rounded-xl border text-center transition-all ${
                      filters.size.includes(size.value)
                        ? 'border-mustard bg-mustard/10'
                        : 'border-lavender/30 hover:bg-lavender/10'
                    }`}
                    onClick={() => {
                      const newSizes = filters.size.includes(size.value)
                        ? filters.size.filter(s => s !== size.value)
                        : [...filters.size, size.value];
                      updateFilters({ size: newSizes });
                    }}
                    data-testid={`size-filter-${size.value}`}
                  >
                    <span className="text-sm font-medium">{size.label}</span>
                    <div className="text-xs text-midnight/60">{size.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <Label className="block text-sm font-medium text-midnight mb-3">Energy Level</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.energyLevel]}
                onValueChange={([value]) => updateFilters({ energyLevel: value })}
                max={5}
                min={1}
                step={1}
                className="w-full"
                data-testid="energy-level-slider"
              />
              <div className="flex justify-between text-xs text-midnight/60">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
              <div className="text-center text-sm font-mono text-midnight">
                Level: {filters.energyLevel}/5
              </div>
            </div>
          </div>

          {/* Good With */}
          <div>
            <Label className="block text-sm font-medium text-midnight mb-3">Good With</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="children"
                  checked={filters.goodWithChildren}
                  onCheckedChange={(checked) => updateFilters({ goodWithChildren: checked === true })}
                  className="border-2 border-mint data-[state=checked]:bg-mint data-[state=checked]:border-mint"
                  data-testid="good-with-children-checkbox"
                />
                <Label htmlFor="children" className="text-sm cursor-pointer">Children</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="other-dogs"
                  checked={filters.goodWithOtherDogs}
                  onCheckedChange={(checked) => updateFilters({ goodWithOtherDogs: checked === true })}
                  className="border-2 border-mint data-[state=checked]:bg-mint data-[state=checked]:border-mint"
                  data-testid="good-with-dogs-checkbox"
                />
                <Label htmlFor="other-dogs" className="text-sm cursor-pointer">Other Dogs</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="cats"
                  checked={filters.goodWithCats}
                  onCheckedChange={(checked) => updateFilters({ goodWithCats: checked === true })}
                  className="border-2 border-mint data-[state=checked]:bg-mint data-[state=checked]:border-mint"
                  data-testid="good-with-cats-checkbox"
                />
                <Label htmlFor="cats" className="text-sm cursor-pointer">Cats</Label>
              </div>
            </div>
          </div>

          {/* Grooming Needs */}
          <div>
            <Label className="block text-sm font-medium text-midnight mb-3">Grooming Requirements</Label>
            <Select value={filters.groomingNeeds} onValueChange={(value) => updateFilters({ groomingNeeds: value })}>
              <SelectTrigger className="w-full p-3 bg-softgray rounded-2xl border border-lavender/30" data-testid="grooming-select">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div>
            <Label className="block text-sm font-medium text-midnight mb-3">Owner Experience</Label>
            <RadioGroup
              value={filters.experience}
              onValueChange={(value) => updateFilters({ experience: value })}
              className="grid grid-cols-1 gap-2"
            >
              {experienceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="border-2 border-mustard text-mustard"
                    data-testid={`experience-${option.value}`}
                  />
                  <Label htmlFor={option.value} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Saved Filters */}
        <div className="mt-8 pt-6 border-t border-lavender/20">
          <h4 className="font-semibold text-midnight mb-3">Saved Filters</h4>
          <div className="space-y-2">
            {savedFilters.map((filter) => (
              <Card
                key={filter.id}
                className="cursor-pointer hover:bg-softgray transition-colors"
                onClick={() => handleLoadSavedFilter(filter.id)}
                data-testid={`saved-filter-${filter.id}`}
              >
                <CardContent className="p-3">
                  <span className="font-medium text-sm">{filter.name}</span>
                  <div className="text-xs text-midnight/60">{filter.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-mustard text-midnight py-4 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all"
            data-testid="apply-filters-button"
          >
            Apply Filters
          </Button>
          <Button
            onClick={handleSaveFilter}
            variant="outline"
            className="w-full border-lavender/30 text-midnight py-3 rounded-2xl font-medium shadow-clay hover:shadow-clay-hover transition-all"
            data-testid="save-filter-button"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Current Filter
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full bg-softgray text-midnight py-3 rounded-2xl font-medium shadow-clay hover:shadow-clay-hover transition-all"
            data-testid="reset-filters-button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>
      </div>
    </div>
  );
}
