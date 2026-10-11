/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Editor – Template Selector
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A component for browsing and selecting project templates.
 * Displays templates in a grid with categories, difficulty levels,
 * and preview information.
 */

import React, { useState, useMemo } from 'react';
import { Panel, Button, Tag, Input, InputGroup, SelectPicker } from '../../ui';
import templates from '../data/templates.json';

/**
 * Template card component
 */
function TemplateCard({ template, onSelect }) {
  const difficultyColors = {
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'red',
  };

  return (
    <div
      className="template-card"
      onClick={() => onSelect(template)}
      style={{
        border: '1px solid var(--rs-border-primary)',
        borderRadius: '8px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'var(--rs-bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--rs-primary-500)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--rs-border-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{template.icon}</span>
        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{template.name}</span>
      </div>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--rs-text-secondary)',
          margin: 0,
          flex: 1,
        }}
      >
        {template.description}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Tag color={difficultyColors[template.difficulty]} size="sm">
          {template.difficulty}
        </Tag>
        {template.tags.slice(0, 2).map(tag => (
          <Tag key={tag} size="sm">
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
}

/**
 * Template Selector component
 * @param {Object} props
 * @param {Function} props.onSelectTemplate - Callback when a template is selected
 * @param {Function} props.onClose - Callback to close the selector
 */
export default function TemplateSelector({ onSelectTemplate, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Category options for the picker
  const categoryOptions = useMemo(
    () => [
      { label: 'All Templates', value: null },
      ...templates.categories.map(cat => ({
        label: `${cat.icon} ${cat.name}`,
        value: cat.id,
      })),
    ],
    []
  );

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.templates.filter(template => {
      // Category filter
      if (selectedCategory && template.difficulty !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelect = template => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  return (
    <Panel
      bordered
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🎮 Choose a Template</span>
          {onClose && (
            <Button appearance="subtle" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      }
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--rs-bg-well)',
      }}
    >
      {/* Search and Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <InputGroup style={{ flex: 1, minWidth: '200px' }}>
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
          <Input placeholder="Search templates..." value={searchQuery} onChange={setSearchQuery} />
        </InputGroup>

        <SelectPicker
          data={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Filter by difficulty"
          style={{ minWidth: '180px' }}
          cleanable
        />
      </div>

      {/* Template Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '0.5rem',
        }}
      >
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--rs-text-secondary)',
            }}
          >
            No templates found matching your criteria.
          </div>
        )}
      </div>

      {/* Create Blank Project Option */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--rs-border-primary)',
          textAlign: 'center',
        }}
      >
        <Button
          appearance="ghost"
          onClick={() => handleSelect({ id: 'blank', name: 'Blank Project', files: {} })}
        >
          📄 Start with a Blank Project
        </Button>
      </div>
    </Panel>
  );
}

/**
 * Helper function to expand template files into a usable project structure
 * @param {Object} template - Template object from templates.json
 * @returns {Object} Expanded file structure
 */
export function expandTemplateFiles(template) {
  const files = {};

  if (!template.files) return files;

  for (const [path, content] of Object.entries(template.files)) {
    if (typeof content === 'string') {
      files[path] = content;
    } else {
      files[path] = JSON.stringify(content, null, 2);
    }
  }

  return files;
}
