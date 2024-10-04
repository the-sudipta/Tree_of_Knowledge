document.addEventListener('DOMContentLoaded', function() {
    var chartDom = document.getElementById('treeChart');
    var myChart = echarts.init(chartDom);
    let currentLeftPosition = '20%';
    var option;
    var isRadial = false;
    
    // Function to generate the initial tree data
    function generateInitialTree(startNode) {
        return [{
            name: startNode,
            id: '1',
            children: []
        }];
    }

    // Initial data structure
    var data = [
        {
            name: 'Knowledge',
            id: '1',
            children: [
                {
                    name: 'Science',
                    id: '1-1',
                    children: [
                        { name: 'Physics', id: '1-1-1' },
                        { name: 'Chemistry', id: '1-1-2' },
                        { name: 'Biology', id: '1-1-3' }
                    ]
                },
                {
                    name: 'Arts',
                    id: '1-2',
                    children: [
                        { name: 'Literature', id: '1-2-1' },
                        { name: 'Music', id: '1-2-2' },
                        { name: 'Visual Arts', id: '1-2-3' }
                    ]
                },
                {
                    name: 'Philosophy',
                    id: '1-3',
                    children: [
                        { name: 'Ethics', id: '1-3-1' },
                        { name: 'Logic', id: '1-3-2' },
                        { name: 'Metaphysics', id: '1-3-3' }
                    ]
                }
            ]
        }
    ];

    window.addEventListener('resize', function() {
        myChart.resize();
    });

    // Function to find a node by its id
    function findNodeById(nodes, id) {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                let found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    // Function to get the path to a node
    function getPathToNode(nodes, id) {
        let path = [];
        let current = findNodeById(nodes, id);
        while (current) {
            path.unshift(current.name);
            current = findNodeById(nodes, current.id.split('-').slice(0, -1).join('-'));
        }
        return path;
    }

    function updateTreeDepth(node, depth) {
        if (!node) return;
        node.collapsed = depth <= 3;  // Collapse nodes beyond depth 3
        if (node.children) {
            node.children.forEach(child => updateTreeDepth(child, depth + 1));
        }
    }

    async function initializeTreeData(data) {
        for (let node of data) {
            updateTreeDepth(node, 0);
            // Expand the top-level node and its immediate children
            node.collapsed = false;
            if (node.children) {
                node.children.forEach(child => child.collapsed = false);
            }
            // Process the root node
            await processRootNode(node);
        }
    }

    // Replace the existing initializeTreeData(data); call with:
    /*(async function() {
        await initializeTreeData(data);
        updateChart();
    })();*/

    function updateChart() {
        if (isRadial) 
        {
            option = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        type: 'tree',
                        data: data,
                        top: '20%',
                        bottom: '20%',
                        layout: 'radial',
                        symbol: 'emptyCircle',
                        symbolSize: 11,
                        initialTreeDepth: 3,
                        animationDurationUpdate: 750,
                        emphasis: {
                            focus: 'descendant'
                        },
                        label: {
                            position: 'radial',
                            rotate: 0,
                            verticalAlign: 'middle',
                            align: 'right',
                            fontSize: 12,
                            distance: 5,
                            formatter: function(params) {
                                return params.name.length > 40 ? params.name.slice(0, 40) + '...' : params.name;
                            }
                        },
                        leaves: {
                            label: {
                                position: 'radial',
                                rotate: 0,
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        },
                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750,
                        itemStyle: {
                            color: '#66c18c',
                            borderColor: '#66c18c'
                        },
                        lineStyle: {
                            color: '#c0a378',
                            curveness: 0.5
                        },
                        roam: true,
                    }
                ]
            };
        } else {
            option = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        type: 'tree',
                        data: data,
                        top: '5%',
                        left: '20%',
                        bottom: '5%',
                        right: '42%',
                        symbolSize: 7,/*function(params) {
                            // Extract the first 3 digits from the node name
                            const sizeCode = params.data.name.substring(0, 3);
                            // Convert the size code to a number and use it as the symbol size
                            return parseInt(sizeCode, 10);
                        },*/
                        label: {
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right',
                            fontSize: 12,
                            distance: 5,
                            formatter: function(params) {
                                return params.name.length > 40 ? params.name.slice(0, 40) + '...' : params.name;
                            }
                        },
                        leaves: {
                            label: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        },
                        emphasis: {
                            focus: 'descendant'
                        },
                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750,
                        initialTreeDepth: -1,  // Expand all nodes initially
                        itemStyle: {
                            color: '#66c18c',
                            borderColor: '#66c18c'
                        },
                        lineStyle: {
                            color: '#c0a378',
                            curveness: 0.5
                        },
                        orient: 'LR',  // Left to Right orientation
                        layout: 'orthogonal',
                        roam: true,  // Enable zooming and panning
                        nodePadding: 20,  // Increase space between nodes
                        nodeGap: 20  // Increase gap between nodes at the same level
                    }
                ]
            };
        }

        myChart.setOption(option);
    }

    async function expandRootNode(rootNode) {
        myChart.showLoading({
            text: 'Expanding...',
            color: '#66c18c',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0)',
            zlevel: 0
        });
	var treeLang = document.getElementById("langInput").value;
	var treeKey = document.getElementById("keyInput").value;

        try {
            const response = await fetch('/generate-nodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeName: rootNode.name, path: [rootNode.name], treeLang: treeLang, keyInp: treeKey }),
            });
            const newNodes = await response.json();
            
            rootNode.children = newNodes.map((name, index) => ({
                name: name,
                id: `${rootNode.id}-${index + 1}`,
            }));
            rootNode.collapsed = false;
            console.log('New nodes added to root:', rootNode.children);
        } catch (error) {
            console.error('Error generating new nodes for root:', error);
        } finally {
            myChart.hideLoading();
        }
        return rootNode;
    }

    updateChart();

    async function processRootNode(rootNode) {
        // Only expand if the node doesn't have children
        if (!rootNode.children || rootNode.children.length === 0) {
            await expandRootNode(rootNode);
            updateChart();
        }
        // Describe the root node
        await describeRootNode(rootNode);
    }

    async function describeRootNode(rootNode) {
        const path = getPathToNode(data, rootNode.id);
        const nodeInfoContent = document.getElementById('nodeInfoContent');
	var treeLang = document.getElementById("langInput").value;
	var treeKey = document.getElementById("keyInput").value;
        nodeInfoContent.innerHTML = marked.parse(`# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\nLoading description...`);
    
        try {
            const response = await fetch('/describe-node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeName: rootNode.name, path: path, treeLang: treeLang, keyInp: treeKey }),
            });
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let markdown = `# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\n`;
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                markdown += chunk;
                nodeInfoContent.innerHTML = marked.parse(markdown);
            }
        } catch (error) {
            console.error('Error fetching root node description:', error);
            nodeInfoContent.innerHTML = marked.parse(`# ${rootNode.name}\n\nPath: ${path.join(' > ')}\n\nError fetching description.`);
        }
    }

   document.getElementById('generateTree').addEventListener('click', function() {
        var startNode = document.getElementById('startNode').value;
        data = generateInitialTree(startNode);
        updateChart();

        console.log('Tree generated, setting timeout for root node processing');

        setTimeout(function() {
            console.log('Timeout reached, processing root node');
            
            if (data && data.length > 0) {
                processRootNode(data[0]);
            } else {
                console.log('No data available for root node processing');
            }
        }, 800);
    });

    let longPressTimer;
    let isLongPress = false;

    myChart.on('click', function(params) {
        if (params.componentType === 'series' && params.seriesType === 'tree') {
           handleNodeInteraction(params).catch(error => console.error('Error in handleNodeInteraction:', error));
        }
    });

    let currentAbortController = null;

    async function handleNodeInteraction(params) {
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;
        var treeLang = document.getElementById("langInput").value;
	var treeKey = document.getElementById("keyInput").value;

        let path = getPathToNode(data, params.data.id);
        console.log('Path to clicked node:', path.join(' > '));

        let clickedNode = findNodeById(data, params.data.id);
        let graphNeedsUpdate = false;

        // Handle expansion/collapse
        if (!clickedNode.children || clickedNode.children.length === 0) {
        myChart.showLoading({
                text: 'Loading...',
                color: '#66c18c',
                textColor: '#000',
                maskColor: 'rgba(255, 255, 255, 0)',
                zlevel: 0
            });
            try {
                const response = await fetch('/generate-nodes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodeName: clickedNode.name, path: path, treeLang: treeLang, keyInp: treeKey }),
                    signal: signal
                });
                const newNodes = await response.json();
                
                clickedNode.children = newNodes.map((name, index) => ({
                    name: name,
                    id: `${clickedNode.id}-${index + 1}`,
                }));
                clickedNode.collapsed = false;
                graphNeedsUpdate = true;
                console.log('New nodes added:', clickedNode.children);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Node generation aborted');
                    return;
                }
                console.error('Error generating new nodes:', error);
            } finally {
                myChart.hideLoading();
            }
        } else {
            clickedNode.collapsed = !clickedNode.collapsed;
            graphNeedsUpdate = true;
        }

        // Update the graph immediately if needed
        if (graphNeedsUpdate) {
            myChart.setOption({
                series: [{
                    data: data,
                    animationDurationUpdate: 750,
                    animationEasingUpdate: 'quinticInOut'
                }]
            });
        }

        // Now fetch and display the node description
        const nodeInfoContent = document.getElementById('nodeInfoContent');
        nodeInfoContent.innerHTML = marked.parse(`# ${clickedNode.name}\n\nPath: ${path.join(' > ')}\n\nLoading description...`);

        try {
            const response = await fetch('/describe-node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeName: clickedNode.name, path: path, treeLang: treeLang, keyInp: treeKey }),
                signal: signal
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let markdown = `\nPath: ${path.join(' > ')}\n\n`;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                markdown += chunk;
                nodeInfoContent.innerHTML = marked.parse(markdown);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Description fetch aborted');
                return;
            }
            console.error('Error fetching node description:', error);
            nodeInfoContent.innerHTML = marked.parse(`# ${clickedNode.name}\n\nPath: ${path.join(' > ')}\n\nError fetching description.`);
        }
    }

    // Add event listener for layout change
    document.getElementById('layoutSelect').addEventListener('change', function() {
        isRadial = this.value === 'radial';
        updateChart();
    });
});
