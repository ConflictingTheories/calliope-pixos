/**
 * ---------------------------------------------------------------
 *                AI Generator - Template Selector
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * UI component for browsing and selecting pre-built game templates.
 */

import React, { useState, useMemo } from 'react';
import {
  Panel,
  Button,
  ButtonGroup,
  Tag,
  Input,
  InputGroup,
  FlexboxGrid,
} from 'rsuite';

import {
  GAME_TEMPLATES,
  TEMPLATE_CATEGORIES,
  COMPLEXITY,
  getStarterTemplates,
  getFeaturedTemplates,
} from './services/game-templates.js';

import './styles/template-selector.css';

/**
 * Complexity badge colors
 */
const COMPLEXITY_COLORS = {
  [COMPLEXITY.STARTER]: 'green',
  [COMPLEXITY.STANDARD]: 'blue',
  [COMPLEXITY.ADVANCED]: 'violet',
};

/**
 * Complexity labels
 */
const COMPLEXITY_LABELS = {
  [COMPLEXITY.STARTER]: '🌱 Starter',
  [COMPLEXITY.STANDARD]: '⭐ Standard',
  [COMPLEXITY.ADVANCED]: '🚀 Advanced',
};

/**
 * Category icons
 */
const CATEGORY_ICONS = {
  [TEMPLATE_CATEGORIES.FANTASY]: '🏰',
  [TEMPLATE_CATEGORIES.SCIFI]: '🚀',
  [TEMPLATE_CATEGORIES.MODERN]: '🏙️',
  [TEMPLATE_CATEGORIES.HORROR]: '👻',
  [TEMPLATE_CATEGORIES.COMEDY]: '😄',
  [TEMPLATE_CATEGORIES.EDUCATIONAL]: '📚',
};

/**
 * Template Card Component
 */
function TemplateCard({ template, onSelect, isSelected }) {
  return (
    <div
      className={`template-card ${isSelected ? 'template-card-selected' : ''}`}
      onClick={() => onSelect(template)}
    >
      <div className="template-card-header">
        <span className="template-card-name">{template.name}</span>
        {template.featured && <Tag color="orange" size="sm">Featured</Tag>}
      </div>

      <p className="template-card-description">{template.description}</p>

      <div className="template-card-meta">
        <Tag color={COMPLEXITY_COLORS[template.complexity]} size="sm">
          {COMPLEXITY_LABELS[template.complexity]}
        </Tag>
        <span className="template-meta-item">
          {CATEGORY_ICONS[template.category]} {template.category}
        </span>
        <span className="template-meta-item">
          ⏱️ {template.estimatedTime}
        </span>
        <span className="template-meta-item">
          📦 ~{template.estimatedAssets} assets
        </span>
      </div>

      <div className="template-card-tags">
        {template.tags.slice(0, 4).map((tag, i) => (
          <Tag key={i} size="sm">{tag}</Tag>
        ))}
      </div>
    </div>
  );
}

/**
 * Template Selector Component
 */
function TemplateSelector({ onSelectTemplate, selectedTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter templates based on search and filter
  const filteredTemplates = useMemo(() => {
    let templates = GAME_TEMPLATES;

    // Apply filter
    if (activeFilter === 'featured') {
      templates = getFeaturedTemplates();
    } else if (activeFilter === 'starter') {
      templates = getStarterTemplates();
    } else if (Object.values(TEMPLATE_CATEGORIES).includes(activeFilter)) {
      templates = templates.filter(t => t.category === activeFilter);
    } else if (Object.values(COMPLEXITY).includes(activeFilter)) {
      templates = templates.filter(t => t.complexity === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [searchQuery, activeFilter]);

  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <h3>🎮 Game Templates</h3>
        <p>Choose a template to generate a complete game package</p>
      </div>

      {/* Search */}
      <div className="template-search">
        <InputGroup inside>
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <InputGroup.Addon>🔍</InputGroup.Addon>
        </InputGroup>
      </div>

      {/* Filters */}
      <div className="template-filters">
        <ButtonGroup size="xs">
          <Button
            appearance={activeFilter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button
            appearance={activeFilter === 'featured' ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter('featured')}
          >
            ⭐ Featured
          </Button>
          <Button
            appearance={activeFilter === 'starter' ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter('starter')}
          >
            🌱 Starters
          </Button>
        </ButtonGroup>

        <ButtonGroup size="xs" style={{ marginLeft: '1rem' }}>
          <Button
            appearance={activeFilter === TEMPLATE_CATEGORIES.FANTASY ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter(TEMPLATE_CATEGORIES.FANTASY)}
          >
            🏰 Fantasy
          </Button>
          <Button
            appearance={activeFilter === TEMPLATE_CATEGORIES.SCIFI ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter(TEMPLATE_CATEGORIES.SCIFI)}
          >
            🚀 Sci-Fi
          </Button>
          <Button
            appearance={activeFilter === TEMPLATE_CATEGORIES.HORROR ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter(TEMPLATE_CATEGORIES.HORROR)}
          >
            👻 Horror
          </Button>
          <Button
            appearance={activeFilter === TEMPLATE_CATEGORIES.EDUCATIONAL ? 'primary' : 'ghost'}
            onClick={() => setActiveFilter(TEMPLATE_CATEGORIES.EDUCATIONAL)}
          >
            📚 Educational
          </Button>
        </ButtonGroup>
      </div>

      {/* Template Grid */}
      <div className="template-grid">
        {filteredTemplates.length === 0 ? (
          <div className="template-empty">
            <p>No templates match your search.</p>
            <Button appearance="ghost" onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}>
              Clear filters
            </Button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
              isSelected={selectedTemplate?.id === template.id}
            />
          ))
        )}
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <Panel bordered className="template-preview">
          <h4>{selectedTemplate.name}</h4>
          <p>{selectedTemplate.description}</p>

          <div className="template-preview-prompt">
            <strong>Generation Prompt:</strong>
            <pre>{selectedTemplate.prompt}</pre>
          </div>

          <div className="template-preview-assets">
            <strong>Expected Assets ({selectedTemplate.expectedAssets.length}):</strong>
            <ul>
              {selectedTemplate.expectedAssets.slice(0, 10).map((asset, i) => (
                <li key={i}>{asset}</li>
              ))}
              {selectedTemplate.expectedAssets.length > 10 && (
                <li>...and {selectedTemplate.expectedAssets.length - 10} more</li>
              )}
            </ul>
          </div>
        </Panel>
      )}
    </div>
  );
}

export default TemplateSelector;
