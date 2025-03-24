import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

def create_circular_plot(output_file='public/tools.svg', cmap='plasma'):
    """Create a circular plot with the given colormap."""
    # Generate grid points
    x = np.linspace(-1, 1, 500)
    y = np.linspace(-1, 1, 500)
    X, Y = np.meshgrid(x, y)
    
    # Create some interesting pattern
    Z = np.sin(5*X) * np.cos(5*Y)
    
    # Create plot
    fig = plt.figure(figsize=(4, 4))
    ax = fig.add_subplot(111)
    
    # Create circular clip path
    circle = Circle((0.5, 0.5), 0.5, transform=ax.transAxes)
    ax.add_patch(circle)
    ax.set_clip_path(circle)
    
    # Plot the pattern
    im = ax.imshow(
        Z,
        extent=[-1, 1, -1, 1],
        cmap=cmap,
        origin='lower',
        aspect='equal',
        interpolation='bilinear'
    )
    
    # Remove all decorations
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_frame_on(False)
    
    plt.tight_layout()
    
    # Save the plot
    plt.savefig(output_file, format='svg', bbox_inches='tight', pad_inches=0)
    plt.close()

if __name__ == '__main__':
    create_circular_plot() 