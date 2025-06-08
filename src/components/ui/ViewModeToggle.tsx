import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store';
import { updateViewConfig } from '../../store/slices/uiSlice';

const ToggleContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #333;
  border-radius: 8px;
  padding: 15px;
  color: white;
  font-family: 'Courier New', monospace;
  z-index: 1000;
  min-width: 250px;
`;

const ControlGroup = styled.div`
  margin: 10px 0;
  padding: 8px 0;
  border-top: 1px solid #444;
`;

const Label = styled.label`
  display: block;
  margin: 5px 0;
  font-size: 11px;
  color: #ccc;
`;

const Input = styled.input`
  background: #222;
  border: 1px solid #555;
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  width: 60px;
  font-family: inherit;
  font-size: 11px;
`;

const InfoText = styled.div`
  font-size: 10px;
  color: #888;
  margin-top: 5px;
  line-height: 1.3;
`;

const ViewModeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const viewConfig = useSelector((state: RootState) => state.ui.viewConfig);

  const handleConfigChange = (key: string, value: number) => {
    dispatch(updateViewConfig({ [key]: value }));
  };

  const calculateTileSize = () => {
    const tileSizeX = viewConfig.canvasWidth / viewConfig.playerViewTilesX;
    const tileSizeY = viewConfig.canvasHeight / viewConfig.playerViewTilesY;
    return Math.min(tileSizeX, tileSizeY).toFixed(1);
  };

  return (
    <ToggleContainer>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '13px' }}>
        View Controls
      </div>

      <ControlGroup>
        <Label>
          Canvas Size:
          <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
            <Input
              type="number"
              value={viewConfig.canvasWidth}
              onChange={(e) => handleConfigChange('canvasWidth', parseInt(e.target.value) || 800)}
              min="400"
              max="2000"
              step="32"
            />
            <span style={{ alignSelf: 'center', fontSize: '10px' }}>×</span>
            <Input
              type="number"
              value={viewConfig.canvasHeight}
              onChange={(e) => handleConfigChange('canvasHeight', parseInt(e.target.value) || 600)}
              min="300"
              max="1500"
              step="32"
            />
          </div>
        </Label>
      </ControlGroup>

      <ControlGroup>
        <Label>
          Visible Tiles:
          <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
            <Input
              type="number"
              value={viewConfig.playerViewTilesX}
              onChange={(e) => handleConfigChange('playerViewTilesX', parseInt(e.target.value) || 10)}
              min="5"
              max="30"
            />
            <span style={{ alignSelf: 'center', fontSize: '10px' }}>×</span>
            <Input
              type="number"
              value={viewConfig.playerViewTilesY}
              onChange={(e) => handleConfigChange('playerViewTilesY', parseInt(e.target.value) || 8)}
              min="5"
              max="25"
            />
          </div>
        </Label>
      </ControlGroup>

      <ControlGroup>
        <Label>
          Camera Smoothing:
          <div style={{ display: 'flex', gap: '5px', marginTop: '3px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', minWidth: '45px' }}>Speed:</span>
            <Input
              type="number"
              value={viewConfig.cameraLerpSpeed}
              onChange={(e) => handleConfigChange('cameraLerpSpeed', parseFloat(e.target.value) || 8)}
              min="1"
              max="20"
              step="0.5"
            />
          </div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '3px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', minWidth: '45px' }}>Deadzone:</span>
            <Input
              type="number"
              value={viewConfig.cameraDeadzone}
              onChange={(e) => handleConfigChange('cameraDeadzone', parseFloat(e.target.value) || 2)}
              min="0"
              max="10"
              step="0.5"
            />
          </div>
        </Label>
      </ControlGroup>

      <InfoText>
        Current tile size: {calculateTileSize()}px<br/>
        Showing {viewConfig.playerViewTilesX}×{viewConfig.playerViewTilesY} tiles<br/>
        Player perspective (focused view)<br/>
        Camera: {viewConfig.cameraLerpSpeed > 15 ? 'Very Responsive' : 
                 viewConfig.cameraLerpSpeed > 10 ? 'Responsive' : 
                 viewConfig.cameraLerpSpeed > 5 ? 'Smooth' : 'Very Smooth'}
      </InfoText>
    </ToggleContainer>
  );
};

export default ViewModeToggle; 